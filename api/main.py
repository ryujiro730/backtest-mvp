from __future__ import annotations
import os, json, uuid, hashlib
from typing import Any, Dict, List
from dotenv import load_dotenv
load_dotenv()  # api/.env を読み込む
from .routes import catalog 

from celery import Celery
import boto3
from botocore.config import Config
import psycopg
+ from fastapi import FastAPI, Header, Response, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from .routes import checkout     # ← 相対インポート


# ---- Try both import paths to match user's project layout ----
try:
    from schemas import StrategyMvp0  # api/ runs as working_dir=/app/api
except Exception:  # pragma: no cover
    from api.schemas import StrategyMvp0  # working_dir=/app

app = FastAPI()

router = APIRouter(prefix="/api") 

# ===== Env =====
def _req(name):
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing required env var: {name}")
    return v

S3_ENDPOINT     = os.getenv("S3_ENDPOINT", "http://minio:9000")  # 既定も minio 推奨
S3_ACCESS_KEY   = _req("S3_ACCESS_KEY")
S3_SECRET_KEY   = _req("S3_SECRET_KEY")
PUBLIC_BUCKET = "public-uploads" 
S3_REGION       = os.getenv("S3_REGION", "us-east-1")
S3_BUCKET_DATA  = os.getenv("S3_BUCKET_DATA", "backtest-data")
S3_BUCKET_STRATEGIES = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
S3_BUCKET_RESULTS    = os.getenv("S3_BUCKET_RESULTS", "results")
DATASET_HASH_DEFAULT = os.getenv("DATASET_HASH_DEFAULT", "")


REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")  # 既定値はcomposeと合わせる
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)


@router.get("/public-uploads/{key:path}")
def serve_public_uploads(key: str):
    # MinIO(S3) からオブジェクトを取ってそのまま返す
    try:
        obj = s3.get_object(Bucket=PUBLIC_BUCKET, Key=key)
    except Exception:
        raise HTTPException(status_code=404, detail="not found")

    body = obj["Body"].read()
    headers = {}
    if "ContentType" in obj:
        headers["Content-Type"] = obj["ContentType"]
    headers.setdefault(
        "Cache-Control",
        "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
    )
    return Response(content=body, headers=headers)


# ===== AWS S3 client (MinIO OK) =====
s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
    config=Config(s3={"addressing_style": "path"}),
)

# ===== Celery (worker is launched with `-A tasks`) =====

celery = Celery("mvp", broker=REDIS_URL, backend=REDIS_URL)


app.include_router(catalog.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://192.168.11.2:3000",
        "http://localhost:3000",
        "https://delvertrade.com",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET","POST","OPTIONS"],
    allow_headers=["*"],
)
app.include_router(checkout.router) 

# ===== Helpers =====
def _strategy_sid(payload: Dict[str, Any]) -> str:
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()[:16]

_UI2META_TF = {"M1":"1m","M5":"5m","M15":"15m","M30":"30m","H1":"1h","H4":"4h","D1":"1d"}
_META2UI_TF = {v:k for k,v in _UI2META_TF.items()}

def _tf_ui_to_meta(tf: str) -> str:
    return _UI2META_TF.get(tf.upper(), tf)

def _tf_meta_to_ui(tf: str) -> str:
    return _META2UI_TF.get(tf.lower(), tf)

def _pair_ui_to_meta(pair: str) -> str:
    p = pair.upper()
    return p if p.endswith("=X") else f"{p}=X"

def _pair_meta_to_ui(pair: str) -> str:
    return pair.replace("=X","").upper()

def _list_dataset_indexes() -> List[Dict[str, Any]]:
    """Scan s3://<bucket>/data/index/*.json and return list of parsed metas."""
    out: List[Dict[str, Any]] = []
    token = None
    while True:
        kw = {"Bucket": S3_BUCKET_DATA, "Prefix": "data/index/"}
        if token:
            kw["ContinuationToken"] = token
        resp = s3.list_objects_v2(**kw)
        for obj in resp.get("Contents", []):
            key = obj["Key"]
            if not key.endswith(".json"):
                continue
            body = s3.get_object(Bucket=S3_BUCKET_DATA, Key=key)["Body"].read()
            try:
                meta = json.loads(body.decode("utf-8"))
                # Normalize keys: expect {"pair":"EURUSD=X","interval":"1h","dataset_hash":"..."}
                item = {
                    "pair": meta.get("pair") or meta.get("symbol") or "",
                    "interval": meta.get("interval") or meta.get("timeframe") or "",
                    "dataset_hash": meta.get("dataset_hash") or meta.get("hash") or "",
                }
                if item["pair"] and item["interval"] and item["dataset_hash"]:
                    out.append(item)
            except Exception:
                continue
        if resp.get("IsTruncated"):
            token = resp.get("NextContinuationToken")
        else:
            break
    return out

# 置き換え: 直接 S3 を走査して pairs/timeframes を作る
def _catalog():
    BUCKET = S3_BUCKET_DATA
    PREFIX = "data/"  # 直下にあるので固定（envでもOK）

    pairs, tfs, items = set(), set(), []
    token = None
    while True:
        kw = {"Bucket": BUCKET, "Prefix": PREFIX}
        if token: kw["ContinuationToken"] = token
        r = s3.list_objects_v2(**kw)

        for o in r.get("Contents", []):
            key = o["Key"]                        # e.g. data/EURUSD_M15.parquet
            if not key.endswith(".parquet"):
                continue
            name = key.rsplit("/", 1)[-1]         # EURUSD_M15.parquet
            base = name[:-8]                      # EURUSD_M15
            parts = base.split("_")
            if len(parts) != 2:
                continue
            pair, tf = parts[0].upper(), parts[1].upper()
            pairs.add(pair); tfs.add(tf)
            items.append({"pair": pair, "timeframe": tf, "dataset_hash": base})

        if not r.get("IsTruncated"): break
        token = r.get("NextContinuationToken")

    return {"items": items, "pairs": sorted(pairs), "timeframes": sorted(tfs)}


def _resolve_dataset_hash(pair: str, timeframe: str) -> str:
    # 受け取った UI 値（EURUSD, H1 等）でそのまま照合
    pair_ui = pair.upper()
    timeframe_ui = timeframe.upper()

    cat = _catalog()
    for it in cat["items"]:
        if it["pair"].upper() == pair_ui and it["timeframe"].upper() == timeframe_ui:
            h = it["dataset_hash"]
            # 実体チェック（parquet が無ければ 422）
            try:
                s3.head_object(Bucket=S3_BUCKET_DATA, Key=f"data/{h}.parquet")
            except Exception:
                raise HTTPException(status_code=422, detail=f"dataset_parquet_missing:{h}")
            return h
    raise HTTPException(status_code=422, detail=f"dataset_not_found:{pair_ui} {timeframe_ui}")




def _thin_equity(points: List[Dict[str, Any]], max_points: int = 1500) -> List[Dict[str, Any]]:
    n = len(points)
    if n <= max_points:
        return points
    step = max(1, (n + max_points - 1) // max_points)
    return points[::step]

# ===== Routes =====
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/catalog")
def api_catalog():
    return _catalog()

@app.post("/api/run", status_code=202)
def api_run(strategy: StrategyMvp0, idem_key: str = Header(..., alias="Idempotency-Key")):
    # json payload (keep aliases so date_range.from remains 'from')
    payload = strategy.model_dump(by_alias=True, exclude_none=True)

    # resolve dataset hash strictly
    dataset_hash = _resolve_dataset_hash(payload["pair"], payload["timeframe"])

    sid = _strategy_sid(payload)

    # store strategy (optional)
    s3.put_object(
        Bucket=S3_BUCKET_STRATEGIES,
        Key=f"strategies/{sid}.json",
        Body=json.dumps(payload).encode("utf-8"),
        ContentType="application/json",
    )

    run_id = str(uuid.uuid4())
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute(
            """
            insert into runs(run_id, sid, seed, code_hash, dataset_hash, status, started_at, idem_key)
            values (%s, %s, %s, %s, %s, 'queued', now(), %s)
            """,
            (run_id, sid, 42, "mvp-0", dataset_hash, idem_key),
        )
        conn.commit()

    # enqueue celery task
    celery.send_task("tasks.run_backtest", args=[run_id, sid, 42, "mvp-0", dataset_hash, "web"])
    return {"run_id": run_id, "status": "queued"}

@app.get("/api/reports/{run_id}")
def api_reports(run_id: str):
    prefix = f"results/{run_id}/"
    try:
        mobj = s3.get_object(Bucket=S3_BUCKET_RESULTS, Key=f"{prefix}metrics.json")
    except Exception:
        raise HTTPException(status_code=202, detail="artifacts_not_ready")
    metrics = json.loads(mobj["Body"].read().decode("utf-8"))

    equity = []
    try:
        eobj = s3.get_object(Bucket=S3_BUCKET_RESULTS, Key=f"{prefix}equity.json")
        raw = json.loads(eobj["Body"].read().decode("utf-8"))
        if isinstance(raw, dict):
            raw = raw.get("equity") or raw.get("series") or raw.get("data") or []
        if not isinstance(raw, list):
            raw = []
        equity = _thin_equity(raw, 1500)
    except Exception:
        equity = []

    return {"run_id": run_id, "status": "done", "summary": metrics.get("summary", {}), "equity": equity}

app.include_router(router)