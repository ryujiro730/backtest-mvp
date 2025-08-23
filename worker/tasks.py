
# tasks.py — Backtest worker (MVP fixed)
import os, io, json, math
import numpy as np
import pandas as pd
import psycopg
from celery import Celery
from dotenv import load_dotenv
from botocore.exceptions import ClientError
import boto3
from botocore.config import Config

# ---- env
load_dotenv()
REDIS_URL    = os.getenv("REDIS_URL", "redis://redis:6379/0")
POSTGRES_URL = os.getenv("POSTGRES_URL")
S3_ENDPOINT  = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_ACCESS_KEY= os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY= os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_REGION    = os.getenv("S3_REGION", "us-east-1")

BKT_DATA     = os.getenv("S3_BUCKET_DATA", "backtest-data")
BKT_STRAT    = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
BKT_RESULTS  = os.getenv("S3_BUCKET_RESULTS", "results")

celery = Celery("worker", broker=REDIS_URL, backend=REDIS_URL)

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
    config=Config(s3={"addressing_style": "path"}),
)

# ========= helpers =========
def _thin_equity(equity_list, max_points=800):
    n = len(equity_list)
    if n <= max_points:
        return equity_list
    step = math.ceil(n / max_points)
    return [equity_list[i] for i in range(0, n, step)]

def _load_strategy_json(sid: str) -> dict:
    obj = s3.get_object(Bucket=BKT_STRAT, Key=f"strategies/{sid}.json")
    return json.loads(obj["Body"].read().decode("utf-8"))

def _load_prices(dataset_hash: str) -> pd.DataFrame:
    last_err = None
    for ext, reader in (("parquet", pd.read_parquet), ("csv", pd.read_csv)):
        key = f"data/{dataset_hash}.{ext}"
        try:
            obj = s3.get_object(Bucket=BKT_DATA, Key=key)
            buf = io.BytesIO(obj["Body"].read())
            df = reader(buf)
            need = {"timestamp","open","high","low","close"}
            if not need.issubset(df.columns):
                raise ValueError(f"columns missing: need={need}, got={set(df.columns)}")
            ts = pd.to_datetime(df["timestamp"], utc=True, errors="raise")
            df["timestamp"] = ts.dt.tz_convert(None)
            for c in ["open","high","low","close"]:
                df[c] = pd.to_numeric(df[c], errors="raise").astype("float64")
            df = df.sort_values("timestamp").reset_index(drop=True)
            return df[["timestamp","open","high","low","close"]]
        except Exception as e:
            last_err = e
            continue
    raise FileNotFoundError(f"data/{dataset_hash}.parquet or .csv not found / invalid: {last_err}")

def _max_drawdown(equity: pd.Series) -> float:
    peak = equity.cummax()
    dd = (peak - equity) / peak
    return float(dd.max()) if len(dd) else 0.0

# ========= indicators =========
def ema(s: pd.Series, n: int) -> pd.Series:
    return s.ewm(span=int(n), adjust=False).mean()

def rsi(close: pd.Series, n: int = 14) -> pd.Series:
    d = close.diff()
    up = d.clip(lower=0.0)
    dn = -d.clip(upper=0.0)
    roll_up = up.ewm(alpha=1/n, adjust=False).mean()
    roll_dn = dn.ewm(alpha=1/n, adjust=False).mean()
    rs = roll_up / (roll_dn.replace(0, np.nan))
    out = 100 - (100 / (1 + rs))
    return out.fillna(50.0)

def atr(df: pd.DataFrame, n: int = 14) -> pd.Series:
    high, low, close = df["high"], df["low"], df["close"]
    prev_close = close.shift(1)
    tr = pd.concat([(high - low), (high - prev_close).abs(), (low - prev_close).abs()], axis=1).max(axis=1)
    return tr.rolling(int(n), min_periods=int(n)).mean().ffill()

# ========= entries =========
def entry_ema_cross(df: pd.DataFrame, cfg: dict, direction: str) -> pd.Series:
    fast = int(cfg.get("fast", 20)); slow = int(cfg.get("slow", 50))
    cross = str(cfg.get("cross", "above")).lower()  # above/below
    f = ema(df["close"], fast); s = ema(df["close"], slow)
    if direction == "short":
        cond = (f < s) if cross == "above" else (f > s)
    else:
        cond = (f > s) if cross == "above" else (f < s)
    cond.iloc[: max(fast, slow)] = False
    return cond

def entry_rsi_threshold(df: pd.DataFrame, cfg: dict, direction: str) -> pd.Series:
    period = int(cfg.get("period", 14)); level = float(cfg.get("level", 50))
    mode = str(cfg.get("mode", "above")).lower()  # above/below
    x = rsi(df["close"], period)
    if direction == "short":
        cond = (x > level) if mode == "above" else (x < level)  # symmetric for MVP
    else:
        cond = (x > level) if mode == "above" else (x < level)
    cond.iloc[: period + 1] = False
    return cond

def entry_breakout(df: pd.DataFrame, cfg: dict, direction: str) -> pd.Series:
    lookback = int(cfg.get("lookback", 20))
    hh = df["high"].rolling(lookback, min_periods=lookback).max().shift(1)
    ll = df["low"].rolling(lookback,  min_periods=lookback).min().shift(1)
    cond = df["close"] < ll if direction == "short" else df["close"] > hh
    cond.iloc[: lookback + 1] = False
    return cond

def build_entry_mask(df: pd.DataFrame, entries: list, direction: str) -> pd.Series:
    masks = []
    for e in entries:
        typ = str(e.get("type", "")).lower()
        if typ == "ema_cross":
            masks.append(entry_ema_cross(df, e, direction))
        elif typ == "rsi_threshold":
            period = int(e.get("period", e.get("length", 14)))
            level  = float(e.get("level", 50))
            ev = str(e.get("event", e.get("mode", "above"))).lower()
            mode = "above" if ev in ("cross_up", "above", "gt", ">", ">=") else "below"
            masks.append(entry_rsi_threshold(df, {"period": period, "level": level, "mode": mode}, direction))
        elif typ == "breakout":
            masks.append(entry_breakout(df, e, direction))
        elif typ == "sma_cross":
            e2 = {"type": "ema_cross", "fast": e.get("short", 20), "slow": e.get("long", 50), "cross": "above"}
            masks.append(entry_ema_cross(df, e2, direction))
        else:
            raise RuntimeError(f"Unsupported entry type: {typ}")
    if not masks:
        return pd.Series(False, index=df.index)
    m = masks[0].copy()
    for k in masks[1:]:
        m = m & k
    return m.astype(int)

# ========= engine =========
def run_engine(df: pd.DataFrame, cfg: dict) -> dict:
    direction = str(cfg.get("direction", "long")).lower()
    fee = float(cfg.get("fee_bps", 5.0)) / 10000.0
    slip = float(cfg.get("slippage_bps", 0.5)) / 10000.0
    exit_cfg = cfg.get("exit", {}) or {}

    ts = df["timestamp"]
    openp = df["open"].astype(float)
    close = df["close"].astype(float)

    pos_mask = build_entry_mask(df, cfg.get("entries", []), direction)
    pos_mask.iloc[:5] = 0  # warmup

    ret = openp.pct_change().fillna(0.0)
    pos_shift = pos_mask.shift(1).fillna(0)
    strat_ret = (pos_shift * ret)

    a14 = atr(df, 14)

    trades = []
    in_pos = False
    entry_px = None
    entry_idx = None

    for i in range(1, len(df) - 1):
        prev, curr = pos_mask.iat[i - 1], pos_mask.iat[i]

        # entry
        if (not in_pos) and prev == 0 and curr == 1:
            fill = openp.iat[i + 1]
            entry_px = fill * (1.0 - slip) if direction == "short" else fill * (1.0 + slip)
            entry_idx = i + 1
            in_pos = True
            strat_ret.iat[i + 1] -= fee + slip
            continue

        # exit by mask drop
        if in_pos and prev == 1 and curr == 0:
            fill = openp.iat[i + 1]
            if direction == "short":
                exit_px = fill * (1.0 + slip)
                pnl = (entry_px / exit_px) - 1.0
            else:
                exit_px = fill * (1.0 - slip)
                pnl = (exit_px / entry_px) - 1.0
            pnl -= (2.0 * fee)
            trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i + 1]),
                           "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
            in_pos = False
            entry_px = None
            entry_idx = None
            strat_ret.iat[i + 1] -= fee + slip
            continue

    equity = (1.0 + strat_ret).cumprod()
    maxdd = _max_drawdown(equity)

    pnls = np.array([t["pnl"] for t in trades], dtype=float) if trades else np.array([])
    gp = pnls[pnls > 0].sum() if pnls.size else 0.0
    gl = -pnls[pnls < 0].sum() if pnls.size else 0.0
    pf = float(gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
    winrate = float((pnls > 0).mean()) if pnls.size else 0.0

    summary = {"pf": round(pf, 4), "winrate": round(winrate, 4),
               "maxdd": round(float(maxdd), 4), "trades": len(trades)}

    return {"summary": summary,
            "equity": [{"t": str(t), "e": float(e)} for t, e in zip(ts, equity)],
            "trades": trades}

def ensure_bucket(bucket: str):
    try:
        s3.head_bucket(Bucket=bucket)
    except ClientError:
        try:
            s3.create_bucket(Bucket=bucket)
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code", "")
            if code not in ("BucketAlreadyOwnedByYou","BucketAlreadyExists"):
                raise

def _write_artifacts(run_id: str, out: dict):
    ensure_bucket(BKT_RESULTS)
    prefix = f"results/{run_id}/"
    metrics = {"summary": out["summary"]}
    equity  = {"equity": out["equity"]}
    s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}metrics.json",
                  Body=json.dumps(metrics).encode("utf-8"),
                  ContentType="application/json")
    s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}equity.json",
                  Body=json.dumps(equity).encode("utf-8"),
                  ContentType="application/json")

@celery.task(name="tasks.run_backtest", autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def run_backtest(run_id, sid, seed, code_hash, dataset_hash, user_id):
    # mark running
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("update runs set status='running' where run_id=%s", (run_id,))
        conn.commit()

    try:
        raw = _load_strategy_json(sid)
        if raw.get("pair") == "__FAIL__":
            raise RuntimeError("forced failure for test")

        direction = str(raw.get("direction", "long")).lower()
        entries = raw.get("entry", [])
        if not isinstance(entries, list) or not entries:
            raise RuntimeError("Strategy payload must have a non-empty 'entry' list")
        exit_cfg = raw.get("exit", {}) or {}

        fee_bps = float(raw.get("fee_bps", os.getenv("FEE_BPS_DEFAULT", "5.0")))
        slip_bps = float(raw.get("slippage_bps", os.getenv("SLIPPAGE_BPS_DEFAULT", "0.5")))

        engine_cfg = {"direction": direction, "fee_bps": fee_bps, "slippage_bps": slip_bps,
                      "entries": entries, "exit": exit_cfg}

        df = _load_prices(dataset_hash)
        out = run_engine(df, engine_cfg)

        # persist artifacts
        _write_artifacts(run_id, out)

        # mark done + summary
        s = out["summary"]
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(
                """
                update runs
                   set status='done', finished_at=now(),
                       pf=%s, winrate=%s, maxdd=%s, trades=%s, error = null
                 where run_id=%s
                """,
                (s["pf"], s["winrate"], s["maxdd"], s["trades"], run_id),
            )
            conn.commit()

        return out["summary"]

    except Exception as e:
        err = f"{type(e).__name__}: {str(e)}"
        if len(err) > 2000: err = err[:2000]
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute("update runs set status='failed', finished_at=now(), error=%s where run_id=%s", (err, run_id))
            conn.commit()
        raise