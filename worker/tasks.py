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

def req(name):
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v

REDIS_URL    = req("REDIS_URL")
POSTGRES_URL = req("POSTGRES_URL")

S3_ENDPOINT  = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_REGION    = os.getenv("S3_REGION", "us-east-1")

BKT_DATA     = os.getenv("S3_BUCKET_DATA", "backtest-data")
BKT_STRAT    = os.getenv("S3_BUCKET_STRATEGIES", "strategies")   # ← これ
BKT_RESULTS  = os.getenv("S3_BUCKET_RESULTS", "results")

S3_ACCESS_KEY = req("S3_ACCESS_KEY")
S3_SECRET_KEY = req("S3_SECRET_KEY")

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

# ===== 1) S3からどのデータを読んだかを必ず記録 =====
def _load_prices(dataset_hash: str) -> pd.DataFrame:
    last_err = None
    for ext, reader in (("parquet", pd.read_parquet), ("csv", pd.read_csv)):
        key = f"data/{dataset_hash}.{ext}"
        try:
            # ← ここを追加
            print(f"[DATA] trying s3://{BKT_DATA}/{key}", flush=True)

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

            # ← ここを追加：サイズと先頭を出す
            print(f"[DATA] loaded {len(df)} rows from {key}. "
                  f"range={df['timestamp'].iloc[0]}→{df['timestamp'].iloc[-1]}", flush=True)
            print("[DATA] head:\n", df.head().to_string(index=False), flush=True)

            return df[["timestamp","open","high","low","close"]]
        except Exception as e:
            last_err = e
            continue
    raise FileNotFoundError(f"data/{dataset_hash}.parquet or .csv not found / invalid: {last_err}")

    # 余計な列を捨てて型を揃える（timeframe等が来ても無視）
    need = ["timestamp","open","high","low","close","volume"]
    df = df[[c for c in need if c in df.columns]].copy()

    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="raise").dt.tz_convert(None)
    for c in ["open","high","low","close","volume"]:
        if c in df:
            df[c] = pd.to_numeric(df[c], errors="raise").astype("float64")

    # 指紋ログ
    print(
        f"[DATA] cols={list(df.columns)} nonzero_close={(df['close']!=0).sum()} "
        f"range={df['timestamp'].iloc[0]}→{df['timestamp'].iloc[-1]}",
        flush=True
    )
    return df

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

# ========= more indicators =========
def macd(close: pd.Series, fast=12, slow=26, signal=9):
    ema_fast = close.ewm(span=int(fast), adjust=False, min_periods=int(fast)).mean()
    ema_slow = close.ewm(span=int(slow), adjust=False, min_periods=int(slow)).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=int(signal), adjust=False, min_periods=int(signal)).mean()
    hist = macd_line - signal_line
    return macd_line, signal_line, hist

def bbands(close: pd.Series, length=20, mult=2.0):
    ma = close.rolling(int(length), min_periods=int(length)).mean()
    sd = close.rolling(int(length), min_periods=int(length)).std(ddof=0)
    upper = ma + float(mult)*sd
    lower = ma - float(mult)*sd
    return lower, ma, upper

def stochastic(df: pd.DataFrame, k=14, d=3, smooth=1):
    ll = df["low"].rolling(int(k), min_periods=int(k)).min()
    hh = df["high"].rolling(int(k), min_periods=int(k)).max()
    raw_k = (df["close"] - ll) / (hh - ll).replace(0, np.nan) * 100.0
    k_sm = raw_k.rolling(int(smooth), min_periods=int(smooth)).mean()
    d_sm = k_sm.rolling(int(d), min_periods=int(d)).mean()
    return k_sm.fillna(50.0), d_sm.fillna(50.0)

def cci(df: pd.DataFrame, length=20, c=0.015):
    tp = (df["high"] + df["low"] + df["close"]) / 3.0
    ma = tp.rolling(int(length), min_periods=int(length)).mean()
    md = (tp - ma).abs().rolling(int(length), min_periods=int(length)).mean()
    return ((tp - ma) / (c * md.replace(0, np.nan))).fillna(0.0)

def _true_range(df: pd.DataFrame):
    high, low, close = df["high"], df["low"], df["close"]
    prev_close = close.shift(1)
    tr = pd.concat([(high - low), (high - prev_close).abs(), (low - prev_close).abs()], axis=1).max(axis=1)
    return tr

def adx(df: pd.DataFrame, length=14):
    high, low, close = df["high"], df["low"], df["close"]
    up_move = high.diff()
    down_move = -low.diff()
    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)
    tr = _true_range(df)
    atr_n = tr.rolling(int(length), min_periods=int(length)).mean().replace(0, np.nan)
    pdi = (pd.Series(plus_dm, index=close.index) / atr_n) * 100.0
    mdi = (pd.Series(minus_dm, index=close.index) / atr_n) * 100.0
    dx = ( (pdi - mdi).abs() / (pdi + mdi).replace(0, np.nan) ) * 100.0
    adx_val = dx.rolling(int(length), min_periods=int(length)).mean().fillna(0.0)
    return adx_val, pdi.fillna(0.0), mdi.fillna(0.0)

def vwap(df: pd.DataFrame):
    # volume が無いデータが多いので、volume が無ければ「typical price」の累積平均をVWAP代替にする
    tp = (df["high"] + df["low"] + df["close"]) / 3.0
    if "volume" in df.columns:
        vol = pd.to_numeric(df["volume"], errors="coerce").fillna(0.0)
        cum_vol = vol.cumsum().replace(0, np.nan)
        cum_tp_vol = (tp * vol).cumsum()
        return (cum_tp_vol / cum_vol).fillna(method="bfill").fillna(method="ffill")
    else:
        return tp.expanding(min_periods=1).mean()

def supertrend(df: pd.DataFrame, length=10, multiplier=3.0):
    _atr = atr(df, length).fillna(method="bfill")
    hl2 = (df["high"] + df["low"]) / 2.0
    upper = hl2 + float(multiplier) * _atr
    lower = hl2 - float(multiplier) * _atr
    st = pd.Series(index=df.index, dtype=float)
    trend_up = True
    for i in range(len(df)):
        if i == 0:
            st.iat[i] = upper.iat[i]
            trend_up = df["close"].iat[i] >= st.iat[i]
            continue
        prev = st.iat[i-1]
        if trend_up:
            st_val = min(upper.iat[i], prev)
            if df["close"].iat[i] < st_val:
                trend_up = False
                st_val = lower.iat[i]
        else:
            st_val = max(lower.iat[i], prev)
            if df["close"].iat[i] > st_val:
                trend_up = True
                st_val = upper.iat[i]
        st.iat[i] = st_val
    # trend boolean
    trend_bool = df["close"] > st
    return st, trend_bool


# ========= entries =========
def entry_ema_cross(df, e, direction):
    fast = int(e.get("fast", 12))
    slow = int(e.get("slow", 26))
    cross = str(e.get("cross", "above")).lower()

    px = pd.to_numeric(df["close"], errors="raise").astype("float64")
    ema_f = px.ewm(span=fast, adjust=False, min_periods=fast).mean()
    ema_s = px.ewm(span=slow, adjust=False, min_periods=slow).mean()

    above = ema_f > ema_s
    cross_up   = (~above.shift(1, fill_value=False)) &  above
    cross_down = ( above.shift(1, fill_value=False)) & ~above

    if cross in ("above","up","cross_up"):
        m = cross_up
    elif cross in ("below","down","cross_down"):
        m = cross_down
    else:
        m = above  # デフォルト

    print(f"[EMA] fast={fast} slow={slow} above={int(above.sum())} "
          f"cross_up={int(cross_up.sum())} cross_down={int(cross_down.sum())}",
          flush=True)
    return m.astype(bool)


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

def entry_macd(df, e, direction):
    f = int(e.get("fast", 12)); s = int(e.get("slow", 26)); sig = int(e.get("signal", 9))
    event = str(e.get("event", "cross_up")).lower()
    m, sigl, _ = macd(df["close"].astype(float), f, s, sig)
    cross_up   = (~(m.shift(1) > sigl.shift(1))) & (m > sigl)
    cross_down = (~(m.shift(1) < sigl.shift(1))) & (m < sigl)
    if event in ("cross_up", "golden", "bull"):
        return cross_up.fillna(False)
    if event in ("cross_down", "dead", "bear"):
        return cross_down.fillna(False)
    if event == "above_zero":
        return (m > 0).fillna(False)
    if event == "below_zero":
        return (m < 0).fillna(False)
    return cross_up.fillna(False)

def entry_bbands(df, e, direction):
    n = int(e.get("length", 20)); mult = float(e.get("mult", 2.0))
    event = str(e.get("event", "cross_below_lower")).lower()
    lower, mid, upper = bbands(df["close"].astype(float), n, mult)
    px = df["close"].astype(float)
    prev = px.shift(1)
    def cross_above(a,b): return (prev <= b) & (px > b)
    def cross_below(a,b): return (prev >= b) & (px < b)
    if event == "touch_upper": return (px >= upper).fillna(False)
    if event == "touch_lower": return (px <= lower).fillna(False)
    if event == "cross_above_upper": return cross_above(prev, upper).fillna(False)
    if event == "cross_below_lower": return cross_below(prev, lower).fillna(False)
    if event == "cross_above_middle": return cross_above(prev, mid).fillna(False)
    if event == "cross_below_middle": return cross_below(prev, mid).fillna(False)
    return cross_below(prev, lower).fillna(False)

def entry_stoch(df, e, direction):
    k = int(e.get("k", 14)); d = int(e.get("d", 3)); sm = int(e.get("smooth", 1))
    event = str(e.get("event", "k_over_d_cross_up")).lower()
    K, D = stochastic(df, k, d, sm)
    prev_up = (K.shift(1) > D.shift(1))
    up = K > D
    cross_up = (~prev_up) & up
    cross_down = prev_up & (~up)
    if event == "k_over_d_cross_up": return cross_up.fillna(False)
    if event == "k_over_d_cross_down": return cross_down.fillna(False)
    if event == "overbought_cross_down": return ((K.shift(1) > e.get("overbought", 80)) & (K < e.get("overbought", 80))).fillna(False)
    if event == "oversold_cross_up": return ((K.shift(1) < e.get("oversold", 20)) & (K > e.get("oversold", 20))).fillna(False)
    return cross_up.fillna(False)

def entry_adx(df, e, direction):
    n = int(e.get("length", 14)); level = float(e.get("level", 20))
    event = str(e.get("event", "adx_gt")).lower()
    adx_v, pdi, mdi = adx(df, n)
    if event == "adx_gt": return (adx_v > level).fillna(False)
    if event == "adx_lt": return (adx_v < level).fillna(False)
    return (adx_v > level).fillna(False)

def entry_cci(df, e, direction):
    n = int(e.get("length", 20)); level = float(e.get("level", 100))
    event = str(e.get("event", "cross_down")).lower()
    x = cci(df, n)
    prev = x.shift(1)
    if event == "cross_up": return ((prev <= level) & (x > level)).fillna(False)
    if event == "cross_down": return ((prev >= level) & (x < level)).fillna(False)
    return ((prev >= level) & (x < level)).fillna(False)

def entry_vwap(df, e, direction):
    v = vwap(df)
    px = df["close"].astype(float)
    prev_above = (px.shift(1) > v.shift(1))
    above = px > v
    cross_up = (~prev_above) & above
    cross_down = prev_above & (~above)
    evt = str(e.get("event", "price_cross_above")).lower()
    return (cross_up if evt == "price_cross_above" else cross_down).fillna(False)

def entry_supertrend(df, e, direction):
    n = int(e.get("length", 10)); mult = float(e.get("multiplier", 3.0))
    st, trend_up = supertrend(df, n, mult)
    evt = str(e.get("event", "trend_up")).lower()
    return (trend_up if evt == "trend_up" else ~trend_up).fillna(False)

def entry_donchian(df, e, direction):
    lookback = int(e.get("lookback", 20))
    side = str(e.get("side", "high")).lower()
    hh = df["high"].rolling(lookback, min_periods=lookback).max().shift(1)
    ll = df["low"].rolling(lookback,  min_periods=lookback).min().shift(1)
    px = df["close"]
    prev = px.shift(1)
    if side == "low":
        return ((prev >= ll) & (px < ll)).fillna(False) if direction=="short" else ((prev <= ll) & (px > ll)).fillna(False)
    else:
        return ((prev <= hh) & (px > hh)).fillna(False) if direction!="short" else ((prev >= hh) & (px < hh)).fillna(False)


# ===== 2) エントリー条件の実際の真偽数を記録 =====
def build_entry_mask(df: pd.DataFrame, entries: list, direction: str) -> pd.Series:
    masks = []
    for i, e in enumerate(entries):
        typ = str(e.get("type", "")).lower()
        if typ == "ema_cross":
            m = entry_ema_cross(df, e, direction)
        elif typ == "rsi_threshold":
            period = int(e.get("period", e.get("length", 14)))
            level  = float(e.get("level", 50))
            ev = str(e.get("event", e.get("mode", "above"))).lower()
            mode = "above" if ev in ("cross_up", "above", "gt", ">", ">=") else "below"
            m = entry_rsi_threshold(df, {"period": period, "level": level, "mode": mode}, direction)
        elif typ == "breakout":
            m = entry_breakout(df, e, direction)
        elif typ == "sma_cross":
            e2 = {"type": "ema_cross", "fast": e.get("short", 20), "slow": e.get("long", 50), "cross": "above"}
            m = entry_ema_cross(df, e2, direction)
        # === new ===
        elif typ == "macd":
            m = entry_macd(df, e, direction)
        elif typ in ("bbands", "bollinger", "bollinger_bands"):
            m = entry_bbands(df, e, direction)
        elif typ in ("stoch","stochastic"):
            m = entry_stoch(df, e, direction)
        elif typ in ("adx","adx_threshold"):
            m = entry_adx(df, e, direction)
        elif typ in ("cci","cci_threshold"):
            m = entry_cci(df, e, direction)
        elif typ in ("vwap",):
            m = entry_vwap(df, e, direction)
        elif typ in ("supertrend",):
            m = entry_supertrend(df, e, direction)
        elif typ in ("donchian_breakout","donchian"):
            m = entry_donchian(df, e, direction)
        else:
            raise RuntimeError(f"Unsupported entry type: {typ}")

        print(f"[ENTRY] cond#{i+1} type={typ} true={int(m.sum())}", flush=True)
        masks.append(m)

    if not masks:
        return pd.Series(False, index=df.index)

    m = masks[0].copy()
    for k in masks[1:]:
        m = m & k

    trans_in  = ((~m.shift(1).fillna(False)) & m).sum()
    trans_out = (( m.shift(1).fillna(False)) & ~m).sum()
    print(f"[ENTRY] final mask: true={int(m.sum())}, entries={int(trans_in)}, exits={int(trans_out)}", flush=True)
    return m.astype(int)


# ========= exit helpers =========

def _initial_r_and_sl(entry_px: float, direction: str, df, i, sl_atr: dict | None, sl_fixed_pips: float | None):
    """初期SL価格とR(価格差)を返す。なければ (None, None)。"""
    if sl_atr:
        n = int(sl_atr.get("n", 14)); k = float(sl_atr.get("k", 2.0))
        _atr = atr(df, n)
        width = float(_atr.iat[i]) * k
        sl = entry_px - width if direction == "long" else entry_px + width
        R = abs(entry_px - sl)
        return sl, R
    if sl_fixed_pips:
        width = float(sl_fixed_pips) * 1e-4  # pips→価格（FX想定）
        sl = entry_px - width if direction == "long" else entry_px + width
        R = abs(entry_px - sl)
        return sl, R
    return None, None

def _tp_price(entry_px: float, direction: str, R: float | None, tp_rr: float | None, tp_fixed_pips: float | None = None):
    """単発TP価格（Rベース or pips）を返す。無ければ None。"""
    if tp_rr and R:
        width = R * float(tp_rr)
        return entry_px + width if direction == "long" else entry_px - width
    if tp_fixed_pips:
        width = float(tp_fixed_pips) * 1e-4
        return entry_px + width if direction == "long" else entry_px - width
    return None

def _hit_stop(long: bool, bar_high: float, bar_low: float, stop_price: float) -> bool:
    return (bar_low <= stop_price) if long else (bar_high >= stop_price)

def _trail_breakeven(pos, be_cfg, last_close):
    # pos: dict を想定 {entry_px, R, side, stop, trailed}
    if not be_cfg or pos.get("R") is None: return
    activate = float(be_cfg.get("activate_at_R", 1.0))
    offset = float(be_cfg.get("offset_pips", 0.0)) * 1e-4
    long = (pos["side"] == "long")
    # 含み益が activate*R を超えたかを価格で判断
    target = pos["entry_px"] + (pos["R"] * activate) if long else pos["entry_px"] - (pos["R"] * activate)
    reached = (last_close >= target) if long else (last_close <= target)
    if reached:
        be = pos["entry_px"] + offset if long else pos["entry_px"] - offset
        # ストップは悪化させない（切り上げ/切り下げのみ）
        if pos.get("stop") is None:
            pos["stop"] = be
        else:
            pos["stop"] = max(pos["stop"], be) if long else min(pos["stop"], be)

def _trail_atr(pos, trail_cfg, inds, i):
    if not trail_cfg: return
    n = int(trail_cfg.get("n", 14)); k = float(trail_cfg.get("k", 2.5))
    mode = str(trail_cfg.get("mode", "chandelier"))
    lookback = int(trail_cfg.get("lookback", 22))
    long = (pos["side"] == "long")
    # ここでは df を触らず、既存インジ関数を使って前計算し、indsに乗せたものを参照する想定
    atr_n = inds[f"atr_{n}"][i]
    if mode == "chandelier":
        if long:
            hh = inds[f"hh_{lookback}"][i]
            stop = hh - atr_n * k
        else:
            ll = inds[f"ll_{lookback}"][i]
            stop = ll + atr_n * k
    else:  # step
        close = inds["close"][i]
        stop = (close - atr_n*k) if long else (close + atr_n*k)
    if pos.get("stop") is None:
        pos["stop"] = stop
    else:
        # 逆行方向へは動かさない
        pos["stop"] = max(pos["stop"], stop) if long else min(pos["stop"], stop)

def _indicator_exit_hit(pos, i, inds, rules):
    """schemas.IndicatorLevel[] を評価。Trueなら bar close 成立（次足成行）。"""
    if not rules: return False
    long = (pos["side"] == "long")
    close = inds["close"]; prev = inds["close_prev"]
    for r in rules:
        side = r.get("side"); 
        if side and side != pos["side"]: 
            continue
        kind = r.get("kind")
        # === RSI ===
        if kind in ("rsi_threshold", "rsi"):
            n = int(r.get("n", r.get("length", 14))); val = float(r.get("value", r.get("level", 50)))
            op = r.get("op")
            rsi_ser = inds[f"rsi_{n}"]
            cur = rsi_ser[i]
            if op == ">=" and cur >= val: return True
            if op == "<=" and cur <= val: return True
        # === EMA Cross ===
        elif kind in ("ema_cross",):
            f = int(r.get("fast", 20)); s = int(r.get("slow", 50))
            ema_f = inds[f"ema_{f}"]; ema_s = inds[f"ema_{s}"]
            up   = (ema_f[i] > ema_s[i]) and (ema_f[i-1] <= ema_s[i-1])
            down = (ema_f[i] < ema_s[i]) and (ema_f[i-1] >= ema_s[i-1])
            d = r.get("dir")
            if d == "up" and up: return True
            if d == "down" and down: return True
        # === MACD ===
        elif kind in ("macd",):
            macd = inds["macd"]; sig = inds["macd_signal"]
            up   = (macd[i] > sig[i]) and (macd[i-1] <= sig[i-1])
            down = (macd[i] < sig[i]) and (macd[i-1] >= sig[i-1])
            d = r.get("dir")
            if d == "up" and up: return True
            if d == "down" and down: return True
        # === BB ===
        elif kind in ("bollinger","bbands"):
            n = int(r.get("n", r.get("length", 20))); k = float(r.get("k", r.get("mult", 2.0)))
            band = r.get("band","mid"); px = inds["close"]; prv = inds["close_prev"]
            mid = inds[f"bb_mid_{n}_{k}"]; upb = inds[f"bb_up_{n}_{k}"]; lowb = inds[f"bb_lo_{n}_{k}"]
            if band == "mid":
                up = (prv <= mid[i-1]) and (px[i] > mid[i])
                dn = (prv >= mid[i-1]) and (px[i] < mid[i])
            elif band == "upper":
                up = inds["high"][i] >= upb[i]; dn = False
            else:
                dn = inds["low"][i]  <= lowb[i]; up = False
            d = r.get("dir")
            if d == "up" and up: return True
            if d == "down" and dn: return True

        elif kind in ("stoch", "stochastic"):
            n = int(r.get("n", r.get("k", 14)))
            kser = inds.get(f"stoch_k_{n}")
            dser = inds.get(f"stoch_d_{n}")
            if kser is None or dser is None:
                K, D = stochastic(pos["df"], n, int(r.get("d", 3)), int(r.get("smooth", 1)))
                inds[f"stoch_k_{n}"] = kser = K.values
                inds[f"stoch_d_{n}"] = dser = D.values
            up   = (kser[i] > dser[i]) and (kser[i-1] <= dser[i-1])
            down = (kser[i] < dser[i]) and (kser[i-1] >= dser[i-1])
            d = r.get("dir")
            if d == "up" and up: return True
            if d == "down" and down: return True

        elif kind in ("adx", "adx_threshold"):
            n = int(r.get("n", r.get("length", 14))); lvl = float(r.get("level", 20))
            adxv = inds.get(f"adx_{n}")
            if adxv is None:
                inds[f"adx_{n}"] = adxv = adx(pos["df"], n).values
            op = r.get("op", ">=")
            cur = adxv[i]
            if op == ">=" and cur >= lvl: return True
            if op == "<=" and cur <= lvl: return True

        elif kind in ("cci", "cci_threshold"):
            n = int(r.get("n", r.get("length", 20))); lvl = float(r.get("level", 100))
            cciv = inds.get(f"cci_{n}")
            if cciv is None:
                inds[f"cci_{n}"] = cciv = cci(pos["df"], n).values
            op = r.get("op", ">="); cur = cciv[i]
            if op == ">=" and cur >=  lvl: return True
            if op == "<=" and cur <=  lvl: return True

        elif kind in ("vwap",):
            v = inds.get("vwap")
            if v is None:
                inds["vwap"] = v = vwap(pos["df"]).values
            px = inds["close"]; prv = inds["close_prev"]
            up   = (px[i] > v[i]) and (prv[i-1] <= v[i-1])
            down = (px[i] < v[i]) and (prv[i-1] >= v[i-1])
            d = r.get("dir", "down" if pos["side"]=="long" else "up")
            if d == "up" and up: return True
            if d == "down" and down: return True

        elif kind in ("supertrend",):
            n = int(r.get("n", r.get("length", 10))); mult = float(r.get("k", r.get("multiplier", 3.0)))
            key = f"supertrend_trend_{n}_{mult}"
            trend = inds.get(key)
            if trend is None:
                st, trend_up = supertrend(pos["df"], n, mult)
                inds[key] = trend = trend_up.astype(int).values  # 1 or 0
            t = trend[i]  # 1=up, 0=down
            if long and t == 0: return True
            if (not long) and t == 1: return True

        elif kind in ("donchian", "donchian_breakout"):
            n = int(r.get("n", r.get("lookback", 20)))
            mid_key = f"don_mid_{n}"
            if mid_key not in inds:
                hh = pd.Series(inds["high"]).rolling(n).max().values
                ll = pd.Series(inds["low"]).rolling(n).min().values
                inds[mid_key] = (hh + ll) / 2.0
            px = inds["close"]; mid = inds[mid_key]; prv = inds["close_prev"]
            up   = (prv[i-1] <= mid[i-1]) and (px[i] >  mid[i])
            down = (prv[i-1] >= mid[i-1]) and (px[i] <  mid[i])
            d = r.get("dir")
            if d == "up" and up: return True
            if d == "down" and down: return True

        # === Stoch / ADX / CCI / VWAP / Supertrend / Donchian ===
        # （略：同様に inds[...] を参照して True/False を返す）
    return False

# ========= engine =========
def run_engine(df: pd.DataFrame, cfg: dict) -> dict:
    direction = str(cfg.get("direction", "long")).lower()
    fee = float(cfg.get("fee_bps", 5.0)) / 10000.0
    slip = float(cfg.get("slippage_bps", 0.5)) / 10000.0
    exit_cfg = cfg.get("exit", {}) or {}

    ts = df["timestamp"]
    openp = df["open"].astype(float)
    close = df["close"].astype(float)

        # ===== pre-compute indicators for exit/trailing =====
    inds = {
        "close": df["close"].astype(float).values,
        "close_prev": df["close"].astype(float).shift(1).fillna(method="bfill").values,
        "high": df["high"].astype(float).values,
        "low": df["low"].astype(float).values,
    }
    # ATR (複数期間に備えて必要なnだけ用意)
    for n in (14, 20, 22, 50):  # 必要に応じて
        inds[f"atr_{n}"] = atr(df, n).values
    # EMA
    for n in (10, 20, 50, 200):
        inds[f"ema_{n}"] = ema(df["close"].astype(float), n).values
    # RSI
    for n in (7, 14, 21):
        inds[f"rsi_{n}"] = rsi(df["close"].astype(float), n).values
    # BB（汎用鍵）
    for n,k in ((20,2.0),(20,1.5)):
        lo, mid, up = bbands(df["close"].astype(float), n, k)
        inds[f"bb_lo_{n}_{k}"] = lo.values
        inds[f"bb_mid_{n}_{k}"] = mid.values
        inds[f"bb_up_{n}_{k}"] = up.values
    # Donchian/HH/LL
    for n in (20, 22):
        inds[f"hh_{n}"] = df["high"].rolling(n).max().values
        inds[f"ll_{n}"] = df["low"].rolling(n).min().values
    # MACD
    macd_line, sig, hist = macd(df["close"].astype(float))
    inds["macd"] = macd_line.values; inds["macd_signal"] = sig.values
    # ほか（stochastic/adx/cci/vwap/supertrend）は既存関数があるので同様にindsへ


    pos_mask = build_entry_mask(df, cfg.get("entries", []), direction)
    pos_mask.iloc[:5] = 0  # warmup
    # 反対側のエントリーマスク（opposite exit 用）
    opp_dir = "short" if direction == "long" else "long"
    pos_mask_opposite = build_entry_mask(df, cfg.get("entries", []), opp_dir)
    pos_mask_opposite.iloc[:5] = 0


    # すべての損益は、エントリー/イグジットイベント時にのみ積む
    strat_ret = pd.Series(0.0, index=df.index, dtype=float)

    trades = []
    in_pos = False
    entry_px = None
    entry_idx = None
    pos = None  # dictで持つ {side, entry_px, entry_idx, stop, tp, R}

    for i in range(1, len(df)-1):  # 次足で約定する都合で -1 まで
        prev = int(pos_mask.iat[i-1]); curr = int(pos_mask.iat[i])

        # === ENTRY ===
        if (not in_pos) and prev == 0 and curr == 1:
            in_pos = True
            entry_px = float(openp.iat[i+1])  # 次足始値で約定
            entry_idx = i
            sl, R = _initial_r_and_sl(entry_px, direction, df, i, exit_cfg.get("sl_atr"), exit_cfg.get("sl_fixed_pips"))
            tp = _tp_price(entry_px, direction, R, exit_cfg.get("tp_rr"), None)
            pos = {"side": direction, "entry_px": entry_px, "entry_idx": i, "stop": sl, "tp": tp, "R": R, "df": df}
            # 手数料（エントリー分）
            strat_ret.iat[i+1] -= (fee + slip)
            continue

        # === EXIT ===
        fill = None
        if in_pos:
            long = (direction == "long")
            hi = float(df["high"].iat[i]); lo = float(df["low"].iat[i])

            # 1) ハードSL/TP intrabar
            if pos.get("stop") is not None and _hit_stop(long, hi, lo, pos["stop"]):
                raw = float(pos["stop"])
                exit_px = raw * (1.0 - slip) if long else raw * (1.0 + slip)  # intrabar でストップ価格約定
                pnl = (exit_px/entry_px - 1.0) if long else (entry_px/exit_px - 1.0)
                pnl -= (fee)  # 片側ぶん
                trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i+1]),
                               "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
                in_pos = False; entry_px=None; entry_idx=None; pos=None
                strat_ret.iat[i+1] += pnl  # or 累積に反映するあなたの方式
                continue

            if pos.get("tp") is not None:
                hit = (hi >= pos["tp"]) if long else (lo <= pos["tp"])
                if hit:
                    raw = float(pos["tp"])
                    exit_px = raw * (1.0 - slip) if long else raw * (1.0 + slip)  # intrabar でTP価格約定

                    pnl = (exit_px/entry_px - 1.0) if long else (entry_px/exit_px - 1.0)
                    pnl -= (fee)
                    trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i+1]),
                                   "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
                    in_pos = False; entry_px=None; entry_idx=None; pos=None
                    strat_ret.iat[i+1] += pnl
                    continue

            # 2) インジ/反対シグナル（bar close確定→次足成行）
            if _indicator_exit_hit(pos, i, inds, exit_cfg.get("indicator_exit")):
                fill = float(openp.iat[i+1])
                exit_px = fill * (1.0 - slip) if long else fill * (1.0 + slip)
                pnl = (exit_px/entry_px - 1.0) if long else (entry_px/exit_px - 1.0)
                pnl -= (fee)
                trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i+1]),
                               "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
                in_pos = False; entry_px=None; entry_idx=None; pos=None
                strat_ret.iat[i+1] += pnl
                continue

            if exit_cfg.get("opposite_signal_exit") and int(pos_mask_opposite.iat[i]) == 1:
                fill = float(openp.iat[i+1]) 
                will_close = True
                exit_px = fill * (1.0 - slip) if long else fill * (1.0 + slip)
                pnl = (exit_px/entry_px - 1.0) if long else (entry_px/exit_px - 1.0)
                pnl -= (fee)
                trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i+1]),
                               "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
                in_pos = False; entry_px=None; entry_idx=None; pos=None
                strat_ret.iat[i+1] += pnl
                continue

            # 3) トレーリング更新 → intrabar判定
            if exit_cfg.get("trailing") == "breakeven":
                _trail_breakeven(pos, exit_cfg.get("breakeven"), float(close.iat[i]))
            elif exit_cfg.get("trailing") == "atr":
                _trail_atr(pos, exit_cfg.get("trail_atr"), inds, i)
            if pos.get("stop") is not None and _hit_stop(long, hi, lo, pos["stop"]):
                raw = float(pos["stop"])
                exit_px = raw * (1.0 - slip) if long else raw * (1.0 + slip)

                pnl = (exit_px/entry_px - 1.0) if long else (entry_px/exit_px - 1.0)
                pnl -= (fee)
                trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i+1]),
                               "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
                in_pos = False; entry_px=None; entry_idx=None; pos=None
                strat_ret.iat[i+1] += pnl
                continue

            # 4) タイムストップ（N本保有→次足成行）
            tsbars = exit_cfg.get("time_stop_bars")
            if tsbars and (i - entry_idx) >= int(tsbars):
                fill = float(openp.iat[i+1])
                exit_px = fill * (1.0 - slip) if long else fill * (1.0 + slip)
                pnl = (exit_px/entry_px - 1.0) if long else (entry_px/exit_px - 1.0)
                pnl -= (fee)
                trades.append({"entry_time": str(ts.iat[entry_idx]), "exit_time": str(ts.iat[i+1]),
                               "entry": float(entry_px), "exit": float(exit_px), "pnl": float(pnl)})
                in_pos = False; entry_px=None; entry_idx=None; pos=None
                strat_ret.iat[i+1] += pnl
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
    equity_thin = _thin_equity(out["equity"], max_points=800)
    equity  = {"equity": equity_thin}
    s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}metrics.json",
                  Body=json.dumps(metrics).encode("utf-8"),
                  ContentType="application/json")
    s3.put_object(Bucket=BKT_RESULTS, Key=f"{prefix}equity.json",
                  Body=json.dumps(equity).encode("utf-8"),
                  ContentType="application/json")

@celery.task(name="tasks.run_backtest", autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def run_backtest(run_id, sid, seed, code_hash, dataset_hash):
    # mark running
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute("update runs set status='running' where run_id=%s", (run_id,))
        conn.commit()

    try:
        raw = _load_strategy_json(sid)
        print(f"[STRAT] sid={sid} entries={json.dumps(raw.get('entry', []))} "
              f"direction={raw.get('direction','long')} fee_bps={raw.get('fee_bps')} "
              f"slip_bps={raw.get('slippage_bps')}", flush=True)
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

        if direction in ("long", "short"):
            engine_cfg["entries"] = [e for e in entries if (e.get("side") in (None, direction))]

        if direction == "both":
            # sideで振り分け
            long_entries  = [e for e in entries if (e.get("side") in (None, "long"))]
            short_entries = [e for e in entries if (e.get("side") in (None, "short"))]

            cfg_long  = {**engine_cfg,  "direction": "long",  "entries": long_entries}
            cfg_short = {**engine_cfg,  "direction": "short", "entries": short_entries}

            out_long  = run_engine(df, cfg_long)
            out_short = run_engine(df, cfg_short)

            # trades 結合
            trades = out_long["trades"] + out_short["trades"]

            # equity 合成（同じtのeを掛け算＝独立運用の合成）
            eq_long  = {e["t"]: e["e"] for e in out_long["equity"]}
            eq_short = {e["t"]: e["e"] for e in out_short["equity"]}
            merged = [{"t": t, "e": eq_long[t] * eq_short.get(t, 1.0)} for t in eq_long.keys()]

            # summary 再計算
            pnls = [t["pnl"] for t in trades]
            gp = sum(p for p in pnls if p > 0.0); gl = -sum(p for p in pnls if p < 0.0)
            pf = (gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
            winrate = (sum(1 for p in pnls if p > 0) / len(pnls)) if pnls else 0.0
            maxdd = 0.0
            peak = 0.0
            for i, e in enumerate(merged):
                peak = max(peak, e["e"])
                if peak > 0:
                    maxdd = max(maxdd, 1 - (e["e"]/peak))

            summary = {"pf": round(pf,4), "winrate": round(winrate,4), "maxdd": round(maxdd,4), "trades": len(trades)}
            out = {"summary": summary, "equity": merged, "trades": trades}
        else:
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