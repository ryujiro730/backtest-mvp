from pathlib import Path
from dotenv import load_dotenv
# ルート（api/ の 1つ上）にある .env を明示指定
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

POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://fx:fxpass@localhost:5432/fxdb")
REDIS_URL    = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# MinIO / S3
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_KEY      = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET   = os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_REGION   = os.getenv("S3_REGION", "us-east-1")
BKT_STRAT   = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
BKT_RESULT  = os.getenv("S3_BUCKET_RESULTS", "results")

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
def enqueue_run(strategy: StrategyMvp0):
    # JSON化（alias使用で "from" を維持）
    strat_dict = strategy.model_dump(by_alias=True, exclude_none=True)
    sid = _strategy_sid(strat_dict)

    # 戦略を MinIO に保存（worker が strategies/{sid}.json を読む）
    s3.put_object(
        Bucket=BKT_STRAT,
        Key=f"strategies/{sid}.json",
        Body=json.dumps(strat_dict).encode("utf-8"),
        ContentType="application/json",
    )

    # データセット解決（MVPは固定 or 環境変数）
    dr = strat_dict["date_range"]
    dataset_hash = _resolve_dataset_hash(strat_dict["pair"], strat_dict["timeframe"], dr["from"], dr["to"])

    run_id = str(uuid.uuid4())
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("""
            insert into runs(run_id, sid, seed, code_hash, dataset_hash, status, started_at)
            values (%s, %s, %s, %s, %s, 'queued', now())
        """, (run_id, sid, 42, "mvp-0", dataset_hash))
        conn.commit()

    # 既存の worker タスクシグネチャに合わせて投げる
    celery.send_task("tasks.run_backtest",
        args=[run_id, sid, 42, "mvp-0", dataset_hash, "anon"])

    return {"run_id": run_id, "status": "queued"}

@app.get("/api/runs/{run_id}")
def get_run(run_id: str):
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("""
            select run_id, sid, status, pf, winrate, maxdd, trades, started_at, finished_at
              from runs
             where run_id = %s
             limit 1
        """, (run_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "not found")
        run_id, sid, status, pf, winrate, maxdd, trades, started_at, finished_at = row
        return {
            "run_id": run_id,
            "sid": sid,
            "status": status,   # queued / running / done / failed
            "pf": pf, "winrate": winrate, "maxdd": maxdd, "trades": trades,
            "started_at": started_at.isoformat(),
            "updated_at": (finished_at or started_at).isoformat(),
        }

# 既存の /api/report/{sid} は残しても良いが、run単位API推奨

