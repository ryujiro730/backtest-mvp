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
BASE = "/delver/data"

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


POSTGRES_URL         = _req("POSTGRES_URL")
REDIS_URL            = os.getenv("REDIS_URL", "redis://redis:6379/0")

from celery import Celery
celery = Celery(
    "backtest",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

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

def load_equity(run_id):
    path = f"data/equity/{run_id}.json"
    with open(path) as f:
        return json.load(f)



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

def _catalog() -> Dict[str, Any]:
    items = []
    pairs, tfs = set(), set()

    for fn in os.listdir("data"):
        if not fn.endswith(".parquet"):
            continue
        base = fn[:-8]  # EURUSD_M15
        if "_" not in base:
            continue
        pair, tf = base.split("_", 1)
        pair, tf = pair.upper(), tf.upper()
        items.append({"pair": pair, "timeframe": tf, "dataset_hash": base})
        pairs.add(pair); tfs.add(tf)

    return {"items": items, "pairs": sorted(pairs), "timeframes": sorted(tfs)}

def _resolve_dataset_hash(pair: str, timeframe: str) -> str:
    cat = _catalog()
    pair = pair.upper(); timeframe = timeframe.upper()

    for it in cat["items"]:
        if it["pair"] == pair and it["timeframe"] == timeframe:
            h = it["dataset_hash"]
            if os.path.exists(f"data/{h}.parquet"):
                return h
            raise HTTPException(status_code=500, detail="dataset_file_missing")

    raise HTTPException(status_code=422, detail="dataset_not_found")


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

        pair = payload["pair"]
        timeframe = payload["timeframe"]
        dataset_hash = _resolve_dataset_hash(pair, timeframe)

        sid = _strategy_sid(payload)
        os.makedirs("data/strategies", exist_ok=True)
        with open(f"{BASE}/strategies/{sid}.json", "w") as f:
            json.dump(payload, f)
        logging.info("RUN step=2 resolved dataset_hash=%s sid=%s", dataset_hash, sid)

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
def get_report(run_id: str):
    base = f"/delver/results/{run_id}"

    # --- ファイルパスを修正 ---
    eq_path = f"{base}/equity.json"
    summary_path = f"{base}/summary.json"
    trades_path = f"{base}/trades.json"

    # --- 各ファイル読み込み ---
    try:
        with open(eq_path) as f:
            equity = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="equity_not_found")

    try:
        with open(summary_path) as f:
            summary = json.load(f)
    except FileNotFoundError:
        summary = None

    try:
        with open(trades_path) as f:
            trades = json.load(f)
    except FileNotFoundError:
        trades = []

    # --- meta 計算 ---
    first_t = equity[0]["t"] if equity else None
    last_t  = equity[-1]["t"] if equity else None

    bars = len(equity)
    duration_days = None
    if first_t and last_t:
        from datetime import datetime
        f = datetime.fromisoformat(first_t)
        l = datetime.fromisoformat(last_t)
        duration_days = (l - f).days

    return {
        "run_id": run_id,
        "summary": summary,
        "stats": {
            "start": first_t,
            "end": last_t,
            "bars": bars,
            "duration_days": duration_days,
        },
        "equity": equity,
        "trades": trades,
    }
