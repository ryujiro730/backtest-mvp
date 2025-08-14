# tasks.py — Backtest worker (SMA cross, API payload compatible)
import os, io, json
import numpy as np
import pandas as pd
import psycopg
from celery import Celery
from dotenv import load_dotenv

# ---- load .env for local run; compose env will still work in containers
load_dotenv()

# ---- Celery / Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
celery = Celery("worker", broker=REDIS_URL, backend=REDIS_URL)

# ---- Postgres
POSTGRES_URL = os.getenv("POSTGRES_URL")  # e.g., postgresql://fx:fxpass@postgres:5432/fxdb

# ---- S3 / MinIO
import boto3
from botocore.config import Config

S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_REGION = os.getenv("S3_REGION", "us-east-1")

BKT_DATA = os.getenv("S3_BUCKET_DATA", "backtest-data")
BKT_STRAT = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
BKT_RESULT = os.getenv("S3_BUCKET_RESULTS", "results")

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
    config=Config(s3={"addressing_style": "path"})
)

# ========= helpers =========
def _load_strategy_json(sid: str) -> dict:
    """strategies/{sid}.json を取得"""
    obj = s3.get_object(Bucket=BKT_STRAT, Key=f"strategies/{sid}.json")
    return json.loads(obj["Body"].read().decode("utf-8"))

def _load_prices(dataset_hash: str) -> pd.DataFrame:
    """
    data/{hash}.parquet（推奨）or data/{hash}.csv をロード。
    必須列: timestamp, open, high, low, close
    timestamp は UTC tz-naive（オフセットなし）昇順に正規化。
    """
    last_err = None
    for ext, reader in (("parquet", pd.read_parquet), ("csv", pd.read_csv)):
        key = f"data/{dataset_hash}.{ext}"
        try:
            obj = s3.get_object(Bucket=BKT_DATA, Key=key)
            buf = io.BytesIO(obj["Body"].read())
            df = reader(buf)
            need = {"timestamp", "open", "high", "low", "close"}
            if not need.issubset(df.columns):
                raise ValueError(f"columns missing: need={need}, got={set(df.columns)}")
            # tz-naive UTC
            ts = pd.to_datetime(df["timestamp"], utc=True, errors="raise")
            df["timestamp"] = ts.dt.tz_convert(None)
            for c in ["open", "high", "low", "close"]:
                df[c] = pd.to_numeric(df[c], errors="raise").astype("float64")
            df = df.sort_values("timestamp").reset_index(drop=True)
            return df[["timestamp", "open", "high", "low", "close"]]
        except Exception as e:
            last_err = e
            continue
    raise FileNotFoundError(f"data/{dataset_hash}.parquet or .csv not found / invalid: {last_err}")

def _max_drawdown(equity: pd.Series) -> float:
    peak = equity.cummax()
    dd = (peak - equity) / peak
    return float(dd.max()) if len(dd) else 0.0

def _pf_winrate_from_trades(trades: list[dict]) -> tuple[float, float]:
    if not trades:
        return 0.0, 0.0
    pnls = np.array([t["pnl"] for t in trades], dtype=float)
    wins = pnls[pnls > 0]
    losses = pnls[pnls < 0]
    gp = wins.sum()
    gl = -losses.sum()
    pf = float(gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
    winrate = float((pnls > 0).mean())
    return pf, winrate

# ========= strategy =========
def run_sma_cross(df: pd.DataFrame, cfg: dict) -> dict:
    """
    cfg: {"type":"sma_cross","short":20,"long":60,"fee_bps":5}
    手数料は片道 bps（例 5 => 0.05%）
    ここでは簡略化のため 約定は「シグナル発生の次バーのリターン」で評価
    """
    short = int(cfg.get("short", 20))
    long = int(cfg.get("long", 60))
    fee_bps = float(cfg.get("fee_bps", 5.0))
    fee = fee_bps / 10000.0

    ts = df["timestamp"]
    close = df["close"].astype(float)

    sma_s = close.rolling(short, min_periods=short).mean()
    sma_l = close.rolling(long, min_periods=long).mean()

    sig = (sma_s > sma_l).astype(int)
    pos = sig.copy()
    pos.iloc[:long] = 0  # ウォームアップ

    ret = close.pct_change().fillna(0.0)
    strat_ret = (pos.shift(1).fillna(0) * ret)

    trades = []
    in_pos = False
    entry_px = None
    for i in range(1, len(df)):
        prev, curr = pos.iat[i - 1], pos.iat[i]
        px_prev, px = close.iat[i - 1], close.iat[i]
        # entry
        if (not in_pos) and prev == 0 and curr == 1:
            in_pos = True
            entry_px = px
            strat_ret.iat[i] -= fee
        # exit
        elif in_pos and prev == 1 and curr == 0:
            in_pos = False
            exit_px = px
            pnl = (exit_px / entry_px) - 1.0 - fee
            trades.append({
                "entry_time": str(ts.iat[i - 1]),
                "exit_time": str(ts.iat[i]),
                "entry": float(entry_px),
                "exit": float(exit_px),
                "pnl": float(pnl),
            })

    equity = (1.0 + strat_ret).cumprod()
    maxdd = _max_drawdown(equity)
    pf, winrate = _pf_winrate_from_trades(trades)
    summary = {"pf": round(pf, 4), "winrate": round(winrate, 4),
               "maxdd": round(maxdd, 4), "trades": len(trades)}

    # 可視化用: 最大2,000点に間引き
    if len(equity) > 2000:
        idx = np.linspace(0, len(equity) - 1, 2000).astype(int)
        eq = equity.iloc[idx].reset_index(drop=True)
        ts_out = ts.iloc[idx].astype(str).tolist()
    else:
        eq = equity.reset_index(drop=True)
        ts_out = ts.astype(str).tolist()
    equity_out = [{"t": t, "e": float(e)} for t, e in zip(ts_out, eq.tolist())]

    return {"summary": summary, "equity": equity_out, "trades": trades}

# ========= Celery tasks =========
@celery.task(name="tasks.add")
def add(x, y): return x + y

@celery.task(
    name="tasks.run_backtest",
    autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3},
)
def run_backtest(run_id, sid, seed, code_hash, dataset_hash, user_id):
    """
    1) strategies/{sid}.json を読み込み（API形式に対応）
    2) data/{dataset_hash}.{parquet|csv} を読み込み
    3) sma_cross を実行（ema_cross を読み替え）
    4) runs テーブル更新 & results/{sid}/{run_id}.json を保存
    """
    # 1) ステータス running
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute(
            "update runs set status='running', started_at=now() where run_id=%s",
            (run_id,),
        )
        conn.commit()

    try:
        # 2) 戦略ロード（APIは {"entry":[{...}], ...} 形式）
        raw = _load_strategy_json(sid)
        if isinstance(raw, dict) and "type" not in raw and isinstance(raw.get("entry"), list) and raw["entry"]:
            strat = raw["entry"][0]
        else:
            strat = raw if isinstance(raw, dict) else {}

        typ = str(strat.get("type", "")).lower()
        if typ == "ema_cross":
            cfg = {
                "type": "sma_cross",
                "short": int(strat.get("fast", 20)),
                "long":  int(strat.get("slow", 50)),
                "fee_bps": float(strat.get("fee_bps", 5.0)),
            }
        elif typ == "sma_cross":
            cfg = {
                "type": "sma_cross",
                "short": int(strat.get("short", 20)),
                "long":  int(strat.get("long", 50)),
                "fee_bps": float(strat.get("fee_bps", 5.0)),
            }
        else:
            raise RuntimeError(f"Unsupported strategy type: {typ}")

        # 3) データ & 実行
        df = _load_prices(dataset_hash)
        out = run_sma_cross(df, cfg)
        summary = out["summary"]

        # 4) DB 更新（done）
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(
                """
                update runs
                   set status='done', finished_at=now(),
                       pf=%s, winrate=%s, maxdd=%s, trades=%s
                 where run_id=%s
                """,
                (summary["pf"], summary["winrate"], summary["maxdd"], summary["trades"], run_id),
            )
            conn.commit()

        # 5) 結果を S3 に保存
        res_key = f"results/{sid}/{run_id}.json"
        payload = {
            "run_id": run_id, "sid": sid, "seed": seed,
            "code_hash": code_hash, "dataset_hash": dataset_hash,
            "cfg": cfg, **out
        }
        s3.put_object(
            Bucket=BKT_RESULT,
            Key=res_key,
            Body=json.dumps(payload).encode("utf-8"),
            ContentType="application/json",
        )
        return summary

    except Exception as e:
        # 失敗時は failed にして再送で拾えるようにする
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(
                "update runs set status='failed', finished_at=now() where run_id=%s",
                (run_id,),
            )
            conn.commit()
        raise

