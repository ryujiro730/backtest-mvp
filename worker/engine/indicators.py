import numpy as np
import pandas as pd


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
