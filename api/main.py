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

DDL_RUNS = """
CREATE TABLE IF NOT EXISTS runs (
    run_id      uuid        PRIMARY KEY,
    sid         text,
    seed        integer,
    code_hash   text,
    dataset_hash text,
    status      text        NOT NULL DEFAULT 'pending',
    created_at  timestamp   NOT NULL DEFAULT now(),
    started_at  timestamp,
    finished_at timestamp,
    error       text,
    idem_key    text        UNIQUE,
    pf          double precision,
    winrate     double precision,
    maxdd       double precision,
    trades      integer,
    expectancy  double precision,
    avg_win     double precision,
    avg_loss    double precision,
    payload     jsonb,
    equity_data jsonb,
    trades_data jsonb
);
CREATE INDEX IF NOT EXISTS idx_runs_status   ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_sid      ON runs(sid);
CREATE INDEX IF NOT EXISTS idx_runs_run_id   ON runs(run_id);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='payload') THEN
        ALTER TABLE runs ADD COLUMN payload jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='equity_data') THEN
        ALTER TABLE runs ADD COLUMN equity_data jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='trades_data') THEN
        ALTER TABLE runs ADD COLUMN trades_data jsonb;
    END IF;
END $$;
"""

def _ensure_schema():
    """起動時にテーブルが無ければ作成する（冪等）。"""
    try:
        url = os.environ["POSTGRES_URL"]
        # Supabase requires SSL; add connect_timeout to avoid hanging startup
        with psycopg.connect(url, connect_timeout=10) as conn, conn.cursor() as cur:
            cur.execute(DDL_RUNS)
            conn.commit()
        logging.info("DB schema ensured (runs table ok)")
    except Exception as e:
        logging.error("_ensure_schema failed: %s", e)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    _ensure_schema()
    yield

app = FastAPI(lifespan=lifespan)

from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

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
    return JSONResponse(status_code=500, content={"detail": "internal_server_error"})

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
        logging.error("Unhandled exception rid=%s path=%s: %s\n%s",
                      rid, str(request.url), str(exc), traceback.format_exc())
        return JSONResponse(
            {
                "error": "internal_server_error",
                "request_id": rid,
            },
            status_code=500,
        )

# ---------- Health ----------
@app.get("/health")
def health():
    return {"ok": True}

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

def _list_parquet_names() -> List[str]:
    """List parquet filenames from S3/R2 (if configured) or local disk."""
    S3_BUCKET = os.getenv("PARQUET_BUCKET")
    if S3_BUCKET:
        try:
            import boto3
            from botocore.config import Config as BotoConfig
            kwargs: dict = {}
            endpoint = os.getenv("AWS_ENDPOINT_URL")
            if endpoint:
                kwargs["endpoint_url"] = endpoint
            s3 = boto3.client("s3", config=BotoConfig(signature_version="s3v4"), **kwargs)
            names = []
            paginator = s3.get_paginator("list_objects_v2")
            for page in paginator.paginate(Bucket=S3_BUCKET, Prefix=os.getenv("PARQUET_PREFIX", "")):
                for obj in page.get("Contents", []):
                    key = obj["Key"].split("/")[-1]
                    if key.endswith(".parquet"):
                        names.append(key)
            return names
        except Exception as e:
            logging.warning("R2 catalog listing failed: %s", e)

    # Local disk fallback
    if not os.path.isdir(BASE):
        return []
    try:
        return [f for f in os.listdir(BASE) if f.endswith(".parquet")]
    except OSError:
        return []


def _catalog() -> Dict[str, Any]:
    items = []
    pairs, tfs = set(), set()
    names = _list_parquet_names()
    for fn in names:
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
            # When using R2, parquet files are downloaded on-demand by the worker
            if os.getenv("PARQUET_BUCKET") or os.path.exists(f"{BASE}/{h}.parquet"):
                return h
            raise HTTPException(status_code=500, detail="dataset_file_missing")

    raise HTTPException(status_code=422, detail="dataset_not_found")


# ---------- API ----------
SQL_INSERT_RUN = """
INSERT INTO runs
    (run_id, sid, seed, code_hash, dataset_hash, status, started_at, idem_key, payload)
VALUES
    (%(run_id)s, %(sid)s, %(seed)s, %(code_hash)s, %(dataset_hash)s,
     %(status)s, NOW(), %(idem_key)s, %(payload)s)
ON CONFLICT (run_id) DO NOTHING;
""".strip()

@app.get("/api/catalog")
def api_catalog():
    return _catalog()


def _ensure_parquet_api(dataset_hash: str) -> str:
    """Return local path to parquet, downloading from R2 if needed."""
    path = f"{BASE}/{dataset_hash}.parquet"
    if os.path.exists(path):
        return path
    S3_BUCKET = os.getenv("PARQUET_BUCKET")
    if not S3_BUCKET:
        raise HTTPException(status_code=404, detail="parquet_not_found")
    try:
        import boto3
        from botocore.config import Config as BotoConfig
        kwargs: dict = {}
        endpoint = os.getenv("AWS_ENDPOINT_URL")
        if endpoint:
            kwargs["endpoint_url"] = endpoint
        s3 = boto3.client("s3", config=BotoConfig(signature_version="s3v4"), **kwargs)
        prefix = os.getenv("PARQUET_PREFIX", "")
        key = f"{prefix}{dataset_hash}.parquet"
        os.makedirs(BASE, exist_ok=True)
        logging.info("Downloading parquet from R2: %s → %s", key, path)
        s3.download_file(S3_BUCKET, key, path)
        return path
    except Exception as e:
        logging.error("R2 parquet download failed: %s", e)
        raise HTTPException(status_code=404, detail="parquet_not_found")


def _chart_data_from_parquet(pair: str, timeframe: str, limit: int, before: int | None = None) -> List[Dict[str, Any]]:
    """Parquet から OHLC を読み、チャート用 JSON で返す。before があればその時刻より前の limit 本。"""
    import pandas as pd
    dataset_hash = _resolve_dataset_hash(pair, timeframe)
    path = _ensure_parquet_api(dataset_hash)
    df = pd.read_parquet(path)
    # 日時列: 列にあればそのまま、なければインデックスを列に
    time_col = None
    for c in ("timestamp", "datetime", "date", "time"):
        if c in df.columns:
            time_col = c
            break
    if time_col is None and hasattr(df.index, "dtype") and pd.api.types.is_datetime64_any_dtype(df.index):
        df = df.reset_index()
        time_col = df.columns[0]
    if time_col is None and df.index.name in ("datetime", "timestamp", "date"):
        df = df.reset_index()
        time_col = df.index.name if df.index.name in df.columns else df.columns[0]
    if time_col is None:
        raise HTTPException(status_code=500, detail="parquet missing timestamp/datetime column")
    df = df.rename(columns={time_col: "timestamp"})
    for col in ("open", "high", "low", "close"):
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"parquet missing column: {col}")
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp", "open", "high", "low", "close"]).sort_values("timestamp").reset_index(drop=True)
    if before is not None:
        before_ts = pd.Timestamp(int(before), unit="s")
        df = df[df["timestamp"] < before_ts]
        df = df.tail(int(limit))
    else:
        df = df.tail(int(limit))
    out = []
    for i in range(len(df)):
        row = df.iloc[i]
        ts = row["timestamp"]
        unix_sec = int(ts.timestamp()) if hasattr(ts, "timestamp") else int(pd.Timestamp(ts).timestamp())
        out.append({
            "time": unix_sec,
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
        })
    return out


@app.get("/api/chart-data")
def api_chart_data(pair: str = "EURUSD", timeframe: str = "H1", limit: int = 10000, before: int | None = None):
    """チャート表示用。before なし＝直近 limit 本。before=Unix秒 あり＝その時刻より前の limit 本（スクロール用）。"""
    if limit <= 0 or limit > 100_000:
        raise HTTPException(status_code=422, detail="limit must be 1..100000")
    try:
        return _chart_data_from_parquet(pair, timeframe, limit, before)
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("chart-data failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/run", status_code=202)
async def api_run(request: Request, idem_key: str = Header(..., alias="Idempotency-Key")):
    try:
        logging.info("RUN step=0 accept")
        raw_body = await request.json()
        # entry_blocks を先に確保（Pydantic が extra を落とす場合に備え、検証前に生値を退避）
        entry_blocks_from_body = raw_body.get("entry_blocks") if isinstance(raw_body.get("entry_blocks"), list) else None
        strategy = StrategyMvp0.model_validate(raw_body)
        payload = strategy.model_dump(by_alias=True, exclude_none=True)
        if entry_blocks_from_body:
            payload["entry_blocks"] = entry_blocks_from_body
            logging.info("RUN step=1 payload_ready (entry_blocks=%d)", len(entry_blocks_from_body))
        else:
            logging.info("RUN step=1 payload_ready (entry_blocks=なし)")

        pair = payload["pair"]
        timeframe = payload["timeframe"]
        dataset_hash = _resolve_dataset_hash(pair, timeframe)

        sid = _strategy_sid(payload)
        # Save strategy JSON to filesystem (local dev / volume mount) — best effort
        try:
            os.makedirs(f"{BASE}/strategies", exist_ok=True)
            with open(f"{BASE}/strategies/{sid}.json", "w") as f:
                json.dump(payload, f)
        except Exception as _fs_err:
            logging.debug("RUN strategy filesystem save skipped: %s", _fs_err)
        logging.info("RUN step=2 resolved dataset_hash=%s sid=%s", dataset_hash, sid)

        run_id = str(uuid.uuid4())
        payload_json = json.dumps(payload)
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
                    "payload": payload_json,
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


def _validate_run_id(run_id: str) -> None:
    """run_id が UUID v4 形式であることを確認（パストラバーサル対策）。"""
    import re
    if not re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", run_id):
        raise HTTPException(status_code=400, detail="invalid_run_id")


def _get_run_row(run_id: str) -> dict:
    """Fetch a run row from DB. Returns dict with all columns."""
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT status, pf, winrate, maxdd, trades, equity_data, trades_data FROM runs WHERE run_id=%s",
            (run_id,),
        )
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="run_not_found")
    return {
        "status": row[0],
        "pf": row[1],
        "winrate": row[2],
        "maxdd": row[3],
        "trades": row[4],
        "equity_data": row[5],
        "trades_data": row[6],
    }


def _load_equity_for_run(run_id: str):
    """Load equity: DB first, filesystem fallback."""
    row = _get_run_row(run_id)
    if row["status"] == "failed":
        raise HTTPException(status_code=200, detail="run_failed")
    if row["status"] not in ("done",):
        raise HTTPException(status_code=202, detail=row["status"])
    if row["equity_data"] is not None:
        return row["equity_data"]
    # Filesystem fallback (local dev)
    path = f"/delver/results/{run_id}/equity.json"
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="report_not_ready")


@app.get("/api/reports/{run_id}/summary")
def get_report_summary(run_id: str):
    _validate_run_id(run_id)
    row = _get_run_row(run_id)

    # Return status immediately so clients know whether to keep polling or stop
    if row["status"] == "failed":
        return JSONResponse({"run_id": run_id, "status": "failed"}, status_code=200)
    if row["status"] not in ("done",):
        return JSONResponse({"run_id": run_id, "status": row["status"]}, status_code=202)

    try:
        equity = _load_equity_for_run(run_id)
        summary = {
            "pf": row["pf"],
            "winrate": row["winrate"],
            "maxdd": row["maxdd"],
            "trades": row["trades"],
        }
        # Try filesystem summary for extra fields (local dev)
        base = f"/delver/results/{run_id}"
        try:
            with open(f"{base}/summary.json") as f:
                summary = json.load(f)
        except FileNotFoundError:
            pass
        if not equity:
            raise HTTPException(status_code=404, detail="report_not_ready")
        return {
            "run_id": run_id,
            "status": "done",
            "summary": summary,
            "stats": {
                "start": equity[0]["t"],
                "end": equity[-1]["t"],
                "bars": len(equity),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("get_report_summary failed: %s", e)
        raise HTTPException(status_code=500, detail="report_load_error")

@app.get("/api/reports/{run_id}/equity")
def get_report_equity(run_id: str):
    _validate_run_id(run_id)
    return _load_equity_for_run(run_id)

@app.get("/api/reports/{run_id}/trades")
def get_report_trades(run_id: str):
    _validate_run_id(run_id)
    row = _get_run_row(run_id)
    if row["status"] == "failed":
        return JSONResponse({"run_id": run_id, "status": "failed"}, status_code=200)
    if row["status"] not in ("done",):
        return JSONResponse({"run_id": run_id, "status": row["status"]}, status_code=202)
    if row["trades_data"] is not None:
        return row["trades_data"]
    # Filesystem fallback
    try:
        with open(f"/delver/results/{run_id}/trades.json") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="report_not_ready")
