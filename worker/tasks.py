# tasks.py — Real Logic v1 (SMA cross)
import os, time, json, io
import numpy as np
import pandas as pd
import psycopg
from celery import Celery
from dotenv import load_dotenv
load_dotenv()

# --- S3 / MinIO ---
import boto3
from botocore.config import Config

# ========= Env =========
REDIS = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DB    = os.getenv("POSTGRES_URL")

S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_KEY      = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET   = os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_REGION   = os.getenv("S3_REGION", "us-east-1")

BKT_DATA   = os.getenv("S3_BUCKET_DATA", "data")
BKT_STRAT  = os.getenv("S3_BUCKET_STRATEGIES", "strategies")
BKT_RESULT = os.getenv("S3_BUCKET_RESULTS", "results")

# ========= Celery =========
celery = Celery("worker", broker=REDIS, backend=REDIS)

# ========= S3 client =========
s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_KEY,
    aws_secret_access_key=S3_SECRET,
    region_name=S3_REGION,
    config=Config(s3={"addressing_style": "path"})
)

# ========= Utils =========
def _load_strategy_json(sid: str) -> dict:
    """strategies/{sid}.json を取得"""
    key = f"strategies/{sid}.json"
    obj = s3.get_object(Bucket=BKT_STRAT, Key=key)
    return json.loads(obj["Body"].read().decode("utf-8"))

def _load_prices_csv(dataset_hash: str) -> pd.DataFrame:
    """data/{dataset_hash}.csv を DataFrame で取得（timestamp昇順, tz-naive UTC）"""
    key = f"data/{dataset_hash}.csv"
    obj = s3.get_object(Bucket=BKT_DATA, Key=key)
    buf = io.BytesIO(obj["Body"].read())
    df = pd.read_csv(buf)
    # 必須列チェック
    need = {"timestamp", "open", "high", "low", "close"}
    if not need.issubset(df.columns):
        raise ValueError(f"CSV columns missing. Need {need}, got {set(df.columns)}")
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True).dt.tz_convert(None)
    df = df.sort_values("timestamp").reset_index(drop=True)
    return df

def _max_drawdown(equity: pd.Series) -> float:
    """最大ドローダウン（率, 0.0~1.0）"""
    peak = equity.cummax()
    dd = (peak - equity) / peak
    return float(dd.max()) if len(dd) else 0.0

def _pf_winrate_from_trades(trades: list[dict]) -> tuple[float, float]:
    """PFと勝率をトレードリストから計算"""
    if not trades:
        return 0.0, 0.0
    pnls = np.array([t["pnl"] for t in trades], dtype=float)
    wins = pnls[pnls > 0]
    losses = pnls[pnls < 0]
    gross_profit = wins.sum()
    gross_loss = -losses.sum()
    pf = float(gross_profit / gross_loss) if gross_loss > 0 else float("inf") if gross_profit > 0 else 0.0
    winrate = float((pnls > 0).mean())
    return pf, winrate

# ========= Backtest Logic (SMA Cross Long-only) =========
def run_sma_cross(df: pd.DataFrame, cfg: dict) -> dict:
    """
    cfg 例:
      {"type":"sma_cross","short":20,"long":60,"fee_bps":5}
      fee_bps=片道手数料(ベーシスポイント)。例: 5 -> 0.05%
    """
    short = int(cfg.get("short", 20))
    long  = int(cfg.get("long", 60))
    fee_bps = float(cfg.get("fee_bps", 5.0))
    fee = fee_bps / 10000.0

    close = df["close"].astype(float)
    ts = df["timestamp"]

    sma_s = close.rolling(short, min_periods=short).mean()
    sma_l = close.rolling(long,  min_periods=long ).mean()

    # シグナル：短期が長期を上抜け → 1、下抜け → 0（フラット）
    sig_raw = (sma_s > sma_l).astype(int)
    # エントリー/エグジットは「次バー始値」で約定とみなす（ルックアヘッド防止）
    # ここでは簡略化：次バーのcloseで約定
    pos = sig_raw.copy()
    pos.iloc[:long] = 0  # ウォームアップ期間は取引しない

    ret = close.pct_change().fillna(0.0)
    strat_ret = (pos.shift(1).fillna(0) * ret)

    # 約定時に手数料控除（売買両方で2回分）
    trades = []
    in_pos = False
    entry_px = None
    for i in range(1, len(df)):
        prev, curr = pos.iat[i-1], pos.iat[i]
        px_prev, px = close.iat[i-1], close.iat[i]
        # エントリー
        if (not in_pos) and prev == 0 and curr == 1:
            in_pos = True
            entry_px = px
            strat_ret.iat[i] -= fee  # 片道
        # エグジット
        elif in_pos and prev == 1 and curr == 0:
            in_pos = False
            exit_px = px
            pnl = (exit_px / entry_px) - 1.0 - fee  # エグジット時 片道
            trades.append({"entry_time": str(ts.iat[i-1]),
                           "exit_time": str(ts.iat[i]),
                           "entry": float(entry_px), "exit": float(exit_px),
                           "pnl": float(pnl)})
    # 未決済は今回クローズ扱いしない

    equity = (1.0 + strat_ret).cumprod()
    maxdd = _max_drawdown(equity)
    pf, winrate = _pf_winrate_from_trades(trades)
    summary = {
        "pf": round(pf, 4),
        "winrate": round(winrate, 4),
        "maxdd": round(maxdd, 4),
        "trades": len(trades),
    }
    # Equity は軽量化して間引き（最大 2,000点）
    if len(equity) > 2000:
        idx = np.linspace(0, len(equity)-1, 2000).astype(int)
        eq = equity.iloc[idx].reset_index(drop=True)
        ts_out = ts.iloc[idx].astype(str).tolist()
    else:
        eq = equity.reset_index(drop=True)
        ts_out = ts.astype(str).tolist()
    summary_equity = [{"t": t, "e": float(e)} for t, e in zip(ts_out, eq.tolist())]

    return {"summary": summary, "equity": summary_equity, "trades": trades}

# ========= Tasks =========
@celery.task(name="tasks.add")
def add(x, y): return x + y

@celery.task(
    name="tasks.run_backtest",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def run_backtest(run_id, sid, seed, code_hash, dataset_hash, user_id):
    """
    1) strategies/{sid}.json を読み込み
    2) data/{dataset_hash}.csv を読み込み
    3) ストラテジ種別で実行（いまは sma_cross のみ）
    4) runs を更新 + results/{sid}/{run_id}.json を保存
    """
    # 実行開始
    with psycopg.connect(DB) as conn, conn.cursor() as cur:
        cur.execute("update runs set status='running', started_at=now() where run_id=%s", (run_id,))
        if cur.rowcount != 1:
            raise RuntimeError(f"run_id not found at start: {run_id}")

    # 入力ロード
    strat = _load_strategy_json(sid)   # {"type":"sma_cross", ...}
    df = _load_prices_csv(dataset_hash)

    # 実行
    typ = (strat.get("type") or "sma_cross").lower()
    if typ == "sma_cross":
        out = run_sma_cross(df, strat)
    else:
        raise ValueError(f"Unsupported strategy type: {typ}")

    summary = out["summary"]

    # 結果をDBに反映
    with psycopg.connect(DB) as conn, conn.cursor() as cur:
        cur.execute("""
            update runs
               set status='done', finished_at=now(),
                   pf=%s, winrate=%s, maxdd=%s, trades=%s
             where run_id=%s
        """, (summary["pf"], summary["winrate"], summary["maxdd"], summary["trades"], run_id))
        if cur.rowcount != 1:
            raise RuntimeError(f"run_id not found at finish: {run_id}")

    # S3に保存
    res_key = f"results/{sid}/{run_id}.json"
    payload = {
        "run_id": run_id, "sid": sid, "seed": seed,
        "code_hash": code_hash, "dataset_hash": dataset_hash,
        **out
    }
    s3.put_object(
        Bucket=BKT_RESULT,
        Key=res_key,
        Body=json.dumps(payload).encode("utf-8"),
        ContentType="application/json",
    )

    return summary

