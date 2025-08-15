# tasks.py — Backtest worker (SMA cross, API payload compatible)
import os, io, json
import math
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
BKT_RESULTS = os.getenv("S3_BUCKET_RESULTS", "results")

def _thin_equity(equity_list, max_points=800):
    """equity: [{t: str, e: float}, ...] を間引きして返す"""
    n = len(equity_list)
    if n <= max_points:
        return equity_list
    step = math.ceil(n / max_points)
    return [equity_list[i] for i in range(0, n, step)]


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

# ==== 追加: インジケータ ====
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
    tr = pd.concat([
        (high - low),
        (high - prev_close).abs(),
        (low - prev_close).abs()
    ], axis=1).max(axis=1)
    return tr.rolling(int(n), min_periods=int(n)).mean().ffill()


# ==== 追加: Entry 条件（方向を考慮して True/False を返す） ====
def entry_ema_cross(df: pd.DataFrame, cfg: dict, direction: str) -> pd.Series:
    fast = int(cfg.get("fast", 20))
    slow = int(cfg.get("slow", 50))
    cross = str(cfg.get("cross", "above")).lower()  # above/below
    f = ema(df["close"], fast)
    s = ema(df["close"], slow)
    if direction == "short":
        # ショートは逆条件
        cond = (f < s) if cross == "above" else (f > s)
    else:
        cond = (f > s) if cross == "above" else (f < s)
    # ウォームアップ期間は False
    cond.iloc[: max(fast, slow)] = False
    return cond

def entry_rsi_threshold(df: pd.DataFrame, cfg: dict, direction: str) -> pd.Series:
    period = int(cfg.get("period", 14))
    level = float(cfg.get("level", 50))
    mode = str(cfg.get("mode", "above")).lower()  # above/below
    x = rsi(df["close"], period)
    if direction == "short":
        # ショートは RSIが高い（overbought）で保持、など逆解釈
        cond = (x > level) if mode == "above" else (x < level)
    else:
        cond = (x > level) if mode == "above" else (x < level)
    cond.iloc[: period + 1] = False
    return cond

def entry_breakout(df: pd.DataFrame, cfg: dict, direction: str) -> pd.Series:
    lookback = int(cfg.get("lookback", 20))
    # 高値ブレイクでロング、安値ブレイクでショート（方向によらずAND合成に使えるように）
    hh = df["high"].rolling(lookback, min_periods=lookback).max().shift(1)
    ll = df["low"].rolling(lookback,  min_periods=lookback).min().shift(1)
    if direction == "short":
        cond = df["close"] < ll
    else:
        cond = df["close"] > hh
    cond.iloc[: lookback + 1] = False
    return cond


# ==== 追加: Exit 判定（次バーでクローズするかのフラグを返す） ====
def exit_time_stop_bars(idx_since_entry: int, cfg: dict) -> bool:
    n = int(cfg.get("bars", 0) or 0)
    return n > 0 and idx_since_entry >= n

def exit_sl_atr(price_now: float, entry_px: float, atr_val: float, cfg: dict, direction: str) -> (bool, float):
    """ATR倍数の固定ストップ。戻り値: (発動したか, stop_px)"""
    mult = float(cfg.get("atr_mult", 2.0))
    if np.isnan(atr_val):
        return False, None
    if direction == "short":
        stop_px = entry_px + mult * atr_val
        return price_now >= stop_px, stop_px
    else:
        stop_px = entry_px - mult * atr_val
        return price_now <= stop_px, stop_px

def exit_tp_rr(price_now: float, entry_px: float, sl_stop_px: float, cfg: dict, direction: str) -> (bool, float):
    """RR倍の利確。SL基準でTP算出。戻り値: (発動, tp_px)"""
    if sl_stop_px is None:
        return False, None
    rr = float(cfg.get("rr", 2.0))
    risk = abs(entry_px - sl_stop_px)
    if direction == "short":
        tp_px = entry_px - rr * risk
        return price_now <= tp_px, tp_px
    else:
        tp_px = entry_px + rr * risk
        return price_now >= tp_px, tp_px

def exit_trailing_breakeven(price_now: float, entry_px: float, sl_stop_px: float, cfg: dict, direction: str) -> (bool, float):
    """含み益が1R進んだらストップを建値へ引き上げ"""
    if sl_stop_px is None:
        return False, None
    rr_to_be = float(cfg.get("rr_to_breakeven", 1.0))
    risk = abs(entry_px - sl_stop_px)
    if direction == "short":
        moved = (entry_px - price_now) >= rr_to_be * risk
        new_stop = entry_px
        return moved and price_now >= new_stop, new_stop
    else:
        moved = (price_now - entry_px) >= rr_to_be * risk
        new_stop = entry_px
        return moved and price_now <= new_stop, new_stop

def exit_trailing_atr_series(df: pd.DataFrame, atr_mult: float, direction: str) -> pd.Series:
    """シンプルなATRトレーリング線（全体シリーズ）。実際のエグジットは next-open で発動。"""
    a = atr(df, 14).fillna(method="bfill")
    if direction == "short":
        trail = df["low"].rolling(1000).min() + atr_mult * a  # ざっくり
    else:
        trail = df["high"].rolling(1000).max() - atr_mult * a
    return trail


def build_entry_mask(df: pd.DataFrame, entries: list, direction: str) -> pd.Series:
    """entriesのAND合成で 1/0 の保持マスクを返す"""
    masks = []
    for e in entries:
        typ = str(e.get("type", "")).lower()
        if typ == "ema_cross":
            masks.append(entry_ema_cross(df, e, direction))
        elif typ == "rsi_threshold":
            masks.append(entry_rsi_threshold(df, e, direction))
        elif typ == "breakout":
            masks.append(entry_breakout(df, e, direction))
        elif typ == "sma_cross":  # 互換
            e2 = {"type": "ema_cross", "fast": e.get("short", 20), "slow": e.get("long", 50), "cross": "above"}
            masks.append(entry_ema_cross(df, e2, direction))
        else:
            raise RuntimeError(f"Unsupported entry type: {typ}")
    if not masks:
        return pd.Series(False, index=df.index)

    m = masks[0].copy()
    for k in masks[1:]:
        m = m & k
    return m.astype(int)  # 1/0


def run_engine(df: pd.DataFrame, cfg: dict) -> dict:
    """
    cfg:
      {
        "direction": "long|short",
        "fee_bps": 5.0,
        "slippage_bps": 0.5,
        "entries": [ {...}, ... ],
        "exit": { "time_stop_bars": {"bars": 100},
                  "sl_atr": {"atr_mult": 2.0},
                  "tp_rr": {"rr": 2.0},
                  "trailing": {"mode": "breakeven|atr", "atr_mult": 2.0, "rr_to_breakeven": 1.0} }
      }
    """
    direction = str(cfg.get("direction", "long")).lower()
    fee = float(cfg.get("fee_bps", 5.0)) / 10000.0
    slip = float(cfg.get("slippage_bps", 0.5)) / 10000.0
    exit_cfg = cfg.get("exit", {}) or {}

    ts = df["timestamp"]
    openp = df["open"].astype(float)
    close = df["close"].astype(float)

    # Entry AND 合成
    pos_mask = build_entry_mask(df, cfg.get("entries", []), direction)  # 1/0
    pos_mask.iloc[:5] = 0  # ウォームアップ雑に

    # 既存の open→open 約定ロジックを流用
    ret = openp.pct_change().fillna(0.0)
    pos_shift = pos_mask.shift(1).fillna(0)  # 次バーから有効
    strat_ret = (pos_shift * ret)

    # 事前計算
    a14 = atr(df, 14)

    trades = []
    in_pos = False
    entry_px = None
    entry_idx = None
    sl_stop_px = None  # 現在のストップ
    trail_series = None

    for i in range(1, len(df) - 1):
        prev, curr = pos_mask.iat[i - 1], pos_mask.iat[i]

        # エントリ: 0->1
        if (not in_pos) and prev == 0 and curr == 1:
            fill = openp.iat[i + 1]
            if direction == "short":
                entry_px = fill * (1.0 - slip)
            else:
                entry_px = fill * (1.0 + slip)
            entry_idx = i + 1
            in_pos = True
            strat_ret.iat[i + 1] -= fee + slip  # 片道

            # SL初期化（sl_atr が有効なら）
            if "sl_atr" in exit_cfg:
                _fired, sl_stop_px = exit_sl_atr(price_now=close.iat[i], entry_px=entry_px,
                                                 atr_val=a14.iat[i], cfg=exit_cfg["sl_atr"], direction=direction)
            else:
                sl_stop_px = None

            # トレール線（atrモードならシリーズ用意）
            if exit_cfg.get("trailing", {}).get("mode") == "atr":
                trail_series = exit_trailing_atr_series(df, float(exit_cfg["trailing"].get("atr_mult", 2.0)), direction)
            else:
                trail_series = None

            continue

        # エグジット: 1->0（次バーでクローズ）
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
            sl_stop_px = None
            strat_ret.iat[i + 1] -= fee + slip
            continue

        # 保持中なら Exit 条件を評価（True なら次バーでクローズに変更）
        if in_pos and prev == 1 and curr == 1:
            bars_held = (i - entry_idx) if entry_idx is not None else 0
            will_exit = False

            # time stop
            if "time_stop_bars" in exit_cfg:
                will_exit = will_exit or exit_time_stop_bars(bars_held, exit_cfg["time_stop_bars"])

            # SL（closeベース評価）
            if "sl_atr" in exit_cfg:
                fired, _stop = exit_sl_atr(price_now=close.iat[i], entry_px=entry_px,
                                           atr_val=a14.iat[i], cfg=exit_cfg["sl_atr"], direction=direction)
                if fired:
                    will_exit = True

            # TP（SLがある時にだけ有効）
            if "tp_rr" in exit_cfg and sl_stop_px is not None:
                fired, _tp = exit_tp_rr(price_now=close.iat[i], entry_px=entry_px,
                                        sl_stop_px=sl_stop_px, cfg=exit_cfg["tp_rr"], direction=direction)
                if fired:
                    will_exit = True

            # トレーリング
            trcfg = exit_cfg.get("trailing", {})
            if trcfg.get("mode") == "breakeven" and sl_stop_px is not None:
                fired, new_stop = exit_trailing_breakeven(close.iat[i], entry_px, sl_stop_px, trcfg, direction)
                if fired:
                    will_exit = True
                # BE は stop を建値に上げるだけにしてもOK（今回は簡略化）

            if trcfg.get("mode") == "atr" and trail_series is not None:
                trail_now = trail_series.iat[i]
                if direction == "short":
                    if close.iat[i] >= float(trail_now):
                        will_exit = True
                else:
                    if close.iat[i] <= float(trail_now):
                        will_exit = True

            if will_exit:
                # 次バーで 1→0 に落とす
                pos_mask.iat[i + 1] = 0

    # 成績集計は既存と同じ
    equity = (1.0 + strat_ret).cumprod()
    maxdd = _max_drawdown(equity)

    def _pf_winrate(trs):
        if not trs: return 0.0, 0.0
        pnls = np.array([t["pnl"] for t in trs], dtype=float)
        wins = pnls[pnls > 0]; losses = pnls[pnls < 0]
        gp = wins.sum(); gl = -losses.sum()
        pf = float(gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
        winrate = float((pnls > 0).mean())
        return pf, winrate

    pf, winrate = _pf_winrate(trades)
    summary = {"pf": round(pf, 4), "winrate": round(winrate, 4),
               "maxdd": round(maxdd, 4), "trades": len(trades)}

    return {
        "summary": summary,
        "equity": [{"t": str(t), "e": float(e)} for t, e in zip(ts, equity)],
        "trades": trades
    }

@celery.task(
    name="tasks.run_backtest",
    autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3},
)
def run_backtest(run_id, sid, seed, code_hash, dataset_hash, user_id):
    # running に更新
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("update runs set status='running' where run_id=%s", (run_id,))
        conn.commit()

    try:
        raw = _load_strategy_json(sid)

        # （テスト用）強制失敗フラグがあれば落とす
        if raw.get("pair") == "__FAIL__":
            raise RuntimeError("forced failure for test")

        direction = str(raw.get("direction", "long")).lower()

        # entry は必須＆リスト
        entries = raw.get("entry", [])
        if not isinstance(entries, list) or not entries:
            raise RuntimeError("Strategy payload must have a non-empty 'entry' list")

        # exit は任意
        exit_cfg = raw.get("exit", {}) or {}

        # エンジン設定（API入力 > 環境変数デフォルト）
        fee_bps = float(raw.get("fee_bps", os.getenv("FEE_BPS_DEFAULT", "5.0")))
        slip_bps = float(raw.get("slippage_bps", os.getenv("SLIPPAGE_BPS_DEFAULT", "0.5")))

        engine_cfg = {
            "direction": direction,
            "fee_bps": fee_bps,
            "slippage_bps": slip_bps,
            "entries": entries,
            "exit": exit_cfg,
        }

        # 実データで実行
        df = _load_prices(dataset_hash)
        out = run_engine(df, engine_cfg)
        summary = out["summary"]

        # 成功でDB更新
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

        # ★ 成果物を S3 に保存（結果は run_id ごとに分離）
        prefix = f"results/{run_id}/"
        s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}metrics.json", Body=..., ContentType="application/json")
        s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}equity.json",  Body=..., ContentType="application/json")

        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(... upsert metrics ...)
            cur.execute(... upsert equity  ...)
            conn.commit()

# 3) 最後に runs を done に更新
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute("""
              update runs set status='done', finished_at=now(),
                pf=%s, winrate=%s, maxdd=%s, trades=%s, error=null
              where run_id=%s
            """, (..., run_id))
            conn.commit()
        # （必要になったら trades も保存できる）
        # s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}trades.json",
        #               Body=json.dumps({"run_id": run_id, "trades": out["trades"]}).encode("utf-8"),
        #               ContentType="application/json")

        return summary
    except Exception as e:
        # 失敗内容を永続化して再送（Celeryの自動リトライにも備える）
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

