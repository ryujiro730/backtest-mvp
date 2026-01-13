# backtest-mvp/api/main.py

from __future__ import annotations

import os
import json
import hashlib
import traceback
import uuid
import logging  # ← ここを上に

from typing import Any, Dict, List

from dotenv import load_dotenv
load_dotenv()

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, EndpointConnectionError

logger = logging.getLogger("uvicorn.error")  # ← import の後に置く

from celery import Celery
import psycopg
# （重複していた import logging, traceback, json, uuid, psycopg は削除）

from starlette.requests import Request

from fastapi import FastAPI, Request, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI(debug=True)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    logging.error("422 Validation Error: %s\nBody: %s", exc.errors(), body.decode())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# 全ての未処理例外をキャッチしてログを出す
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error("500 Internal Error at %s: %s\n%s",
                  request.url.path,
                  str(exc),
                  traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": str(exc)})

# ---- Strategy schema ----
try:
    from schemas import StrategyMvp0        # when working_dir=/app/api
except Exception:
    from api.schemas import StrategyMvp0    # when working_dir=/app

# ---------- JSON error middleware (traceback) ----------
@app.middleware("http")
async def json_errors(request: Request, call_next):
    rid = str(uuid.uuid4())
    request.state.rid = rid
    try:
        resp = await call_next(request)
        resp.headers["X-Request-Id"] = rid
        return resp
    except Exception as exc:
        return JSONResponse(
            {
                "error": "unhandled_exception",
                "detail": str(exc),
                "traceback": traceback.format_exc(),
                "request_id": rid,
                "path": str(request.url),
            },
            status_code=500,
        )

# ---------- Health / Boom ----------
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/__boom__")
def boom():
    raise RuntimeError("boom!")

# ---------- Env ----------
def _req(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing required env var: {name}")
    return v

S3_ENDPOINT   = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_ACCESS_KEY = _req("S3_ACCESS_KEY")
S3_SECRET_KEY = _req("S3_SECRET_KEY")
S3_REGION     = os.getenv("S3_REGION", "us-east-1")

S3_BUCKET_DATA       = os.getenv("S3_BUCKET_DATA", "backtest-data")
S3_BUCKET_STRATEGIES = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
S3_BUCKET_RESULTS    = os.getenv("S3_BUCKET_RESULTS", "results")
PUBLIC_BUCKET        = os.getenv("PUBLIC_BUCKET", "public-uploads")

POSTGRES_URL         = _req("POSTGRES_URL")
REDIS_URL            = os.getenv("REDIS_URL", "redis://redis:6379/0")

# ---------- Clients ----------
ENDPOINT = os.getenv("S3_ENDPOINT") or os.getenv("MINIO_ENDPOINT") or "http://minio:9000"
ACCESS   = os.getenv("S3_ACCESS_KEY") or os.getenv("MINIO_ACCESS_KEY")
SECRET   = os.getenv("S3_SECRET_KEY") or os.getenv("MINIO_SECRET_KEY")
REGION   = os.getenv("S3_REGION", "us-east-1")

from botocore.config import Config
_CFG = Config(
    s3={"addressing_style": "path"},
    retries={"max_attempts": 2, "mode": "standard"},
    connect_timeout=3,
    read_timeout=10,
    signature_version="s3v4",
)

_s3 = None
def get_s3():
    global _s3
    if _s3 is None:
        _s3 = boto3.client(
            "s3",
            endpoint_url=ENDPOINT,
            aws_access_key_id=ACCESS,
            aws_secret_access_key=SECRET,
            region_name=REGION,
            config=_CFG,
        )
    return _s3

def refresh_s3():
    global _s3
    _s3 = None
    return get_s3()

# 起動時ログも専用ロガーで
logger.warning(f"[BOOT] S3 endpoint={ENDPOINT} access={ACCESS[:3]}***")
try:
    logger.warning(f"[BOOT] buckets={[b['Name'] for b in get_s3().list_buckets().get('Buckets',[])]}")
except Exception as e:
    logger.error(f"[BOOT] list_buckets error: {e!r}")

s3 = boto3.client(
  "s3",
  endpoint_url=ENDPOINT,
  aws_access_key_id=ACCESS,
  aws_secret_access_key=SECRET,
  region_name=os.getenv("S3_REGION","us-east-1"),
  config=Config(s3={"addressing_style": "path"}))

celery = Celery("mvp", broker=REDIS_URL, backend=REDIS_URL)

logging.warning(f"[BOOT] S3 endpoint={ENDPOINT} access={ACCESS[:3]}***")
logging.warning(f"[BOOT] buckets={[b['Name'] for b in s3.list_buckets().get('Buckets',[])]}")


# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://delvertrade.com",
        "https://www.delvertrade.com",
        "http://localhost:3000",           # ローカル開発で使うなら残す
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",  # 必要なら
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # Content-Type/Authorization などまとめて許可
)


# ---------- Helpers ----------
def _strategy_sid(payload: Dict[str, Any]) -> str:
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()[:16]

def _thin_equity(
    points: List[Dict[str, Any]],
    max_points: int = 1500,
) -> List[Dict[str, Any]]:
    n = len(points)
    if n <= max_points: return points
    step = max(1, (n + max_points - 1) // max_points)
    return points[::step]

# _catalog を差し替え
def _catalog() -> Dict[str, Any]:
    pairs, tfs, items = set(), set(), []
    token = None

    s3 = get_s3()
    logger.warning(f"[CATALOG] endpoint={s3.meta.endpoint_url}")

    while True:
        kw = {"Bucket": S3_BUCKET_DATA, "Prefix": "data/"}
        if token:
            kw["ContinuationToken"] = token

        # 失敗時はクライアント再生成で1回だけリトライ
        for attempt in (1, 2):
            try:
                r = s3.list_objects_v2(**kw)
                break
            except EndpointConnectionError as e:
                logger.error(f"[CATALOG] EndpointConnectionError (try {attempt}): {e}")
                if attempt == 2:
                    raise
                s3 = refresh_s3()

        for o in r.get("Contents", []):
            key = o["Key"]
            if not key.endswith(".parquet"):
                continue
            base = key.rsplit("/", 1)[-1][:-8]  # EURUSD_M15
            pair, tf = base.split("_", 1)
            pair, tf = pair.upper(), tf.upper()
            pairs.add(pair); tfs.add(tf)
            items.append({"pair": pair, "timeframe": tf, "dataset_hash": base})

        if not r.get("IsTruncated"):
            break
        token = r.get("NextContinuationToken")

    return {"items": items, "pairs": sorted(pairs), "timeframes": sorted(tfs)}



def _resolve_dataset_hash(pair: str, timeframe: str) -> str:
    pair = pair.upper(); timeframe = timeframe.upper()
    cat = _catalog()
    for it in cat["items"]:
        if it["pair"] == pair and it["timeframe"] == timeframe:
            h = it["dataset_hash"]
            # parquet 実体チェック
            s3.head_object(Bucket=S3_BUCKET_DATA, Key=f"data/{h}.parquet")
            return h
    raise HTTPException(status_code=422, detail=f"dataset_not_found:{pair} {timeframe}")

# ---------- Public uploads proxy (optional) ----------
@app.get("/api/public-uploads/{key:path}")
def serve_public_uploads(key: str):
    try:
        obj = s3.get_object(Bucket=PUBLIC_BUCKET, Key=key)
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("NoSuchKey", "404"): raise HTTPException(status_code=404, detail=f"no_such_key:{key}")
        if code == "AccessDenied":        raise HTTPException(status_code=403, detail="access_denied")
        raise
    body = obj["Body"].read()
    headers = {"Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"}
    ctype = obj.get("ContentType")
    if ctype: headers["Content-Type"] = ctype
    return Response(content=body, headers=headers)

# ---------- API ----------
SQL_INSERT_RUN = """
INSERT INTO runs
    (run_id, sid, seed, code_hash, dataset_hash, status, started_at, idem_key)
VALUES
    (%(run_id)s, %(sid)s, %(seed)s, %(code_hash)s, %(dataset_hash)s,
     %(status)s, NOW(), %(idem_key)s)
ON CONFLICT (run_id) DO NOTHING;
""".strip()

@app.get("/api/catalog")
def api_catalog():
    return _catalog()

@app.post("/api/run", status_code=202)
def api_run(strategy: StrategyMvp0, idem_key: str = Header(..., alias="Idempotency-Key")):
    try:
        logging.info("RUN step=0 accept")
        payload = strategy.model_dump(by_alias=True, exclude_none=True)
        logging.info("RUN step=1 payload_ready")

        dataset_hash = _resolve_dataset_hash(payload["pair"], payload["timeframe"])
        sid = _strategy_sid(payload)
        logging.info("RUN step=2 resolved dataset_hash=%s sid=%s", dataset_hash, sid)

        s3.put_object(
            Bucket=S3_BUCKET_STRATEGIES,
            Key=f"strategies/{sid}.json",
            Body=json.dumps(payload).encode("utf-8"),
            ContentType="application/json",
        )
        logging.info("RUN step=3 s3_put_ok")

        run_id = str(uuid.uuid4())
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            logging.info("RUN step=4 db_insert begin")
            cur.execute(
                SQL_INSERT_RUN,
                {
                    "run_id": run_id,
                    "sid": sid,
                    "seed": 42,
                    "code_hash": "mvp-0",
                    "dataset_hash": dataset_hash,
                    "status": "queued",
                    "idem_key": idem_key,
                },
            )
            conn.commit()
        logging.info("RUN step=5 db_insert_ok")

        celery.send_task("tasks.run_backtest", args=[run_id, sid, 42, "mvp-0", dataset_hash])
        logging.info("RUN step=6 celery_ok")

        return {"run_id": run_id, "status": "queued"}


    except Exception as e:
        logging.exception("RUN step=ERR %s", e)
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/reports/{run_id}")
def api_reports(run_id: str):
    prefix = f"results/{run_id}/"
    # metrics
    try:
        mobj = s3.get_object(Bucket=S3_BUCKET_RESULTS, Key=f"{prefix}metrics.json")
        metrics = json.loads(mobj["Body"].read().decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=202, detail="artifacts_not_ready")
    # equity (optional)
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
