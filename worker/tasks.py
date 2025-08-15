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
    cfg:
      {"type":"sma_cross","short":20,"long":60,
       "fee_bps":5.0, "slippage_bps":0.5, "direction":"long|short"}
    """
    short = int(cfg.get("short", 20))
    long = int(cfg.get("long", 60))
    fee_bps = float(cfg.get("fee_bps", 5.0))
    slip_bps = float(cfg.get("slippage_bps", 0.0))
    direction = str(cfg.get("direction", "long")).lower()

    fee = fee_bps / 10000.0
    slip = slip_bps / 10000.0

    ts = df["timestamp"]
    openp = df["open"].astype(float)
    close = df["close"].astype(float)

    # シグナルは従来どおりcloseベースのSMA
    sma_s = close.rolling(short, min_periods=short).mean()
    sma_l = close.rolling(long,  min_periods=long).mean()

    if direction == "short":
        sig = (sma_s < sma_l).astype(int)  # 保持=1 をショートと解釈
    else:
        sig = (sma_s > sma_l).astype(int)  # long

    pos = sig.copy()
    pos.iloc[:long] = 0  # ウォームアップ

    # リターンは open→open
    ret = openp.pct_change().fillna(0.0)
    pos_shift = pos.shift(1).fillna(0)  # 次バーから有効
    strat_ret = (pos_shift * ret)

    trades = []
    in_pos = False
    entry_px = None
    entry_idx = None

    # エントリ/イグジット時のコスト（fee+slip）をそのバーに差し引く
    for i in range(1, len(df) - 1):  # i+1 を触るので末尾-1まで
        prev, curr = pos.iat[i - 1], pos.iat[i]

        # 0->1 エントリ（次バーopenで約定）
        if (not in_pos) and prev == 0 and curr == 1:
            fill_px = openp.iat[i + 1]
            if direction == "short":
                # ショートの不利スリッページ：エントリ価格は低くなる
                entry_px = fill_px * (1.0 - slip)
            else:
                # ロングの不利スリッページ：エントリ価格は高くなる
                entry_px = fill_px * (1.0 + slip)
            entry_idx = i + 1
            in_pos = True
            strat_ret.iat[i + 1] -= fee + slip  # 片道コスト
            continue

        # 1->0 エグジット（次バーopenで約定）
        if in_pos and prev == 1 and curr == 0:
            fill_px = openp.iat[i + 1]
            if direction == "short":
                # ショートの不利スリッページ：買い戻しは高くなる
                exit_px = fill_px * (1.0 + slip)
                pnl = (entry_px / exit_px) - 1.0  # ショートの損益
            else:
                # ロング：売りは安くなる
                exit_px = fill_px * (1.0 - slip)
                pnl = (exit_px / entry_px) - 1.0

            # 片道手数料×2
            pnl -= (2.0 * fee)

            trades.append({
                "entry_time": str(ts.iat[entry_idx]),
                "exit_time": str(ts.iat[i + 1]),
                "entry": float(entry_px),
                "exit": float(exit_px),
                "pnl": float(pnl),
            })

            in_pos = False
            entry_px = None
            entry_idx = None
            strat_ret.iat[i + 1] -= fee + slip  # 片道コスト
            continue

    # エクイティと指標
    equity = (1.0 + strat_ret).cumprod()
    maxdd = _max_drawdown(equity)

    def _pf_winrate(trs):
        if not trs: return 0.0, 0.0
        pnls = np.array([t["pnl"] for t in trs], dtype=float)
        wins = pnls[pnls > 0]
        losses = pnls[pnls < 0]
        gp = wins.sum(); gl = -losses.sum()
        pf = float(gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
        winrate = float((pnls > 0).mean())
        return pf, winrate

    pf, winrate = _pf_winrate(trades)
    summary = {"pf": round(pf, 4), "winrate": round(winrate, 4),
               "maxdd": round(maxdd, 4), "trades": len(trades)}

    # 可視化用の間引きは既存ロジックのまま（省略）

    return {"summary": summary, "equity": [{"t": str(t), "e": float(e)} for t, e in zip(ts, equity)], "trades": trades}


@celery.task(
    name="tasks.run_backtest",
    autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3},
)
def run_backtest(run_id, sid, seed, code_hash, dataset_hash, user_id):
    # ...（省略）...
    try:
        raw = _load_strategy_json(sid)

        # ★ 強制失敗テストは try の中に置く
        if raw.get("pair") == "__FAIL__":
            raise RuntimeError("forced failure for test")

        # 以降、direction 受け渡しなど既存ロジック…


        # ★ direction の受け渡し（ない場合は long）
        direction = str(raw.get("direction", "long")).lower()

        # entryの型に応じてcfgを作る（既存流用）+ slippage_bps を追加
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
                # ★ schemaに無くても来なければデフォルト0.5bpsを使う（環境変数で上書き可）
                "slippage_bps": float(strat.get("slippage_bps", float(os.getenv("SLIPPAGE_BPS_DEFAULT", "0.5")))),
                "direction": direction,
            }
        elif typ == "sma_cross":
            cfg = {
                "type": "sma_cross",
                "short": int(strat.get("short", 20)),
                "long":  int(strat.get("long", 50)),
                "fee_bps": float(strat.get("fee_bps", 5.0)),
                "slippage_bps": float(strat.get("slippage_bps", float(os.getenv("SLIPPAGE_BPS_DEFAULT", "0.5")))),
                "direction": direction,
            }
        else:
            raise RuntimeError(f"Unsupported strategy type: {typ}")

        df = _load_prices(dataset_hash)
        out = run_sma_cross(df, cfg)
        summary = out["summary"]

        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(
                """
                update runs
                   set status='done', finished_at=now(),
                       pf=%s, winrate=%s, maxdd=%s, trades=%s, error = null
                 where run_id=%s
                """,
                (summary["pf"], summary["winrate"], summary["maxdd"], summary["trades"], run_id),
            )
            conn.commit()

        # 結果をS3保存（既存通り）
        # ...

        return summary

    except Exception as e:
        # ★ 失敗理由を保存（長すぎる場合は切る）
        err = f"{type(e).__name__}: {str(e)}"
        if len(err) > 2000:
            err = err[:2000]
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(
                "update runs set status='failed', finished_at=now(), error=%s where run_id=%s",
                (err, run_id),
            )
            conn.commit()
        raise
