from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Query, Header, HTTPException  # Header を確実に import# ルート（api/ の 1つ上）にある .env を明示指定
import json
import botocore


PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env", override=True)
import os
S3_ENDPOINT = os.getenv("S3_ENDPOINT")
S3_KEY      = os.getenv("S3_ACCESS_KEY")
S3_SECRET   = os.getenv("S3_SECRET_KEY")
assert all([S3_ENDPOINT, S3_KEY, S3_SECRET]), "S3 環境変数が足りない"

import os, uuid, json, hashlib
import psycopg
import boto3
from botocore.config import Config
from fastapi import FastAPI, HTTPException
from celery import Celery

from .schemas import StrategyMvp0
# 追加（ファイル上部のimportのすぐ下あたりに）
def _thin(eq, max_points=800):
    n = len(eq)
    if n <= max_points: 
        return eq
    step = max(1, (n + max_points - 1) // max_points)
    return eq[::step]

BKT_RESULTS = os.getenv("S3_BUCKET_RESULTS", "results")  # ← 複数形で統一

# 差し替え
from fastapi import Query


POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://fx:fxpass@localhost:5432/fxdb")
REDIS_URL    = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# MinIO / S3
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_KEY      = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET   = os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_REGION   = os.getenv("S3_REGION", "us-east-1")
BKT_STRAT   = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
BKT_RESULTS  = os.getenv("S3_BUCKET_RESULTS", "results")

# データセットの解決（MVP：とりあえず環境変数で一本化）
DATASET_DEFAULT_HASH = os.getenv("DATASET_HASH_DEFAULT", "demo")

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET,
    region_name=S3_REGION,
    config=Config(s3={"addressing_style": "path"}),
)

celery = Celery("api", broker=REDIS_URL, backend=REDIS_URL)
app = FastAPI()

@app.get("/api/reports/{run_id}")
def get_report(
    run_id: str,
    with_equity: bool = Query(True),
    max_points: int = Query(800, ge=50, le=5000),
):
    # まずDB存在確認
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("select run_id, status from runs where run_id=%s", (run_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="run_not_found")
        status = row[1]

    # 成果物をS3から取得
    prefix = f"results/{run_id}/"
    try:
        m = s3.get_object(Bucket=BKT_RESULTS, Key=f"{prefix}metrics.json")
        metrics = json.loads(m["Body"].read())
        equity = []
        if with_equity:
            e = s3.get_object(Bucket=BKT_RESULTS, Key=f"{prefix}equity.json")
            equity = json.loads(e["Body"].read()).get("equity", [])
            equity = _thin(equity, max_points)
    except botocore.exceptions.ClientError:
        if status in ("queued", "running"):
            raise HTTPException(status_code=202, detail="artifacts_not_ready")
        raise HTTPException(status_code=404, detail="artifacts_not_found")

    return {
        "run_id": run_id,
        "status": status,
        "summary": metrics.get("summary", {}),
        **({ "equity": equity } if with_equity else {}),
        "artifacts": {"metrics": f"{prefix}metrics.json", "equity": f"{prefix}equity.json"}

    }

@app.get("/health")
def health():
    return {"ok": True}

def _strategy_sid(strategy_json: dict) -> str:
    """戦略JSONから決定的に sid を作る（同一設定は同一sid）"""
    blob = json.dumps(strategy_json, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()[:16]

def _resolve_dataset_hash(pair: str, timeframe: str, date_from: str, date_to: str) -> str:
    # 本実装までの間は既定のハッシュを使う
    return DATASET_DEFAULT_HASH

@app.post("/api/run", status_code=202)
def enqueue_run(
    strategy: StrategyMvp0,
    idem_key: str = Header(..., alias="Idempotency-Key")  # ★ 必須ヘッダ
):
    # 既存: strat_dict/sid作成はそのまま
    strat_dict = strategy.model_dump(by_alias=True, exclude_none=True)
    sid = _strategy_sid(strat_dict)

    # ★ 既存キーがあれば再利用（同じrun_idを返す）
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("select run_id, status from runs where idem_key=%s limit 1", (idem_key,))
        row = cur.fetchone()
        if row:
            run_id, status = row
            return {"run_id": run_id, "status": status}

    # 戦略をMinIOへ保存（既存のまま）
    s3.put_object(
        Bucket=BKT_STRAT,
        Key=f"strategies/{sid}.json",
        Body=json.dumps(strat_dict).encode("utf-8"),
        ContentType="application/json",
    )

    dr = strat_dict["date_range"]
    dataset_hash = _resolve_dataset_hash(strat_dict["pair"], strat_dict["timeframe"], dr["from"], dr["to"])

    run_id = str(uuid.uuid4())
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        # ★ idem_key を保存
        cur.execute("""
            insert into runs(run_id, sid, seed, code_hash, dataset_hash, status, started_at, idem_key)
            values (%s, %s, %s, %s, %s, 'queued', now(), %s)
        """, (run_id, sid, 42, "mvp-0", dataset_hash, idem_key))
        conn.commit()

    celery.send_task("tasks.run_backtest",
        args=[run_id, sid, 42, "mvp-0", dataset_hash, "anon"])

    return {"run_id": run_id, "status": "queued"}

