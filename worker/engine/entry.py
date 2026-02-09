# worker/engine/entry.py

import pandas as pd
from datetime import time as dtime
import numpy as np
from .indicators import (
    rsi, stochastic, cci, adx, macd, bbands, vwap, supertrend
)

# ========= entries =========
def entry_ema_cross(df, e, direction):
    fast = int(e.get("fast", 12))
    slow = int(e.get("slow", 26))
    cross = str(e.get("cross", "above")).lower()

    px = pd.to_numeric(df["close"], errors="raise").astype("float64")
    ema_f = px.ewm(span=fast, adjust=False).mean()
    ema_s = px.ewm(span=slow, adjust=False).mean()


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
    period = int(cfg.get("period", 14))
    level = float(cfg.get("level", 50))
    event = str(cfg.get("event", cfg.get("mode", "above"))).lower()
    x = rsi(df["close"], period)
    prev = x.shift(1)
    cond = (x > level)  # default
    if event in ("cross_down", "below_cross", "dead", "bear"):
        # 境界を下に跨いだ1本だけ: 前足は level 以上、当足は level 未満
        cond = (prev >= level) & (x < level)
    elif event in ("cross_up", "above_cross", "golden", "bull"):
        # 境界を上に跨いだ1本だけ: 前足は level 以下、当足は level 超
        cond = (prev <= level) & (x > level)
    else:
        # above / below: 当足だけで判定（従来どおり）
        mode = "above" if event in ("above", "gt", ">", ">=") else "below"
        if direction == "short":
            cond = (x > level) if mode == "above" else (x < level)
        else:
            cond = (x > level) if mode == "above" else (x < level)
    cond.iloc[: period + 1] = False
    return cond

def entry_breakout(df, cfg, direction):
    lookback = int(cfg.get("lookback", 20))
    hh = df["high"].rolling(lookback, min_periods=lookback).max().shift(1)
    ll = df["low"].rolling(lookback,  min_periods=lookback).min().shift(1)

    if direction == "short":
        cond = df["low"] < ll
    else:
        cond = df["high"] > hh

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

# ====　タイムゾーン処理　＝＝＝＝＝

def entry_time_window(df: pd.DataFrame, e: dict, direction: str) -> pd.Series:
    """
    schemas.TimeWindowEntry に対応:
    {
      "type": "time_window",
      "days": {"Mon": true, "Tue": false, ...},
      "intraday": {"enabled": true, "from": "09:00", "to": "17:00"},
      "period_start": "2020-01-01",  # 任意（YYYY-MM-DD）
      "period_end": "2024-12-31"     # 任意
    }
    """

    # datetime / timestamp を取得
    if "datetime" in df.columns:
        dt = pd.to_datetime(df["datetime"])
    elif "timestamp" in df.columns:
        dt = pd.to_datetime(df["timestamp"])
    else:
        raise RuntimeError("time_window requires 'datetime' or 'timestamp' column")

    # --- バックテスト期間フィルタ（日付のみ比較）---
    period_start = e.get("period_start")
    period_end = e.get("period_end")
    if period_start or period_end:
        date_only = dt.dt.normalize().dt.date
        if period_start:
            start_d = pd.to_datetime(period_start).date()
            mask_period_start = date_only >= start_d
        else:
            mask_period_start = pd.Series(True, index=df.index)
        if period_end:
            end_d = pd.to_datetime(period_end).date()
            mask_period_end = date_only <= end_d
        else:
            mask_period_end = pd.Series(True, index=df.index)
        mask_period = mask_period_start & mask_period_end
    else:
        mask_period = pd.Series(True, index=df.index)

    # --- 曜日フィルタ ---
    days_cfg = e.get("days") or {}
    enabled_days = {k for k, v in days_cfg.items() if v}

    if enabled_days:
        # "Mon" / "Tue" ... に揃える（フロントは mon/tue、バックエンドは day_name で Mon/Tue）
        dow = dt.dt.day_name().str[:3]
        # フロントが mon/tue を送る場合、先頭大文字に正規化
        enabled_normalized = {d.capitalize() for d in enabled_days}
        mask_day = dow.isin(enabled_normalized)
    else:
        mask_day = pd.Series(True, index=df.index)

    # --- 時間帯フィルタ ---
    intr = e.get("intraday") or {}
    if intr.get("enabled") and intr.get("from") and intr.get("to"):
        def _parse_hm(s: str) -> int:
            h, m = map(int, str(s).split(":"))
            return h * 60 + m

        from_min = _parse_hm(intr["from"])
        to_min   = _parse_hm(intr["to"])
        minutes  = dt.dt.hour * 60 + dt.dt.minute

        if from_min <= to_min:
            mask_time = (minutes >= from_min) & (minutes <= to_min)
        else:
            mask_time = (minutes >= from_min) | (minutes <= to_min)
    else:
        mask_time = pd.Series(True, index=df.index)

    m = mask_period & mask_day & mask_time
    m.iloc[:1] = False
    return m

# ===== プライスアクション =====
def _ohlc(df: pd.DataFrame):
    o = df["open"].astype(float)
    h = df["high"].astype(float)
    l = df["low"].astype(float)
    c = df["close"].astype(float)
    return o, h, l, c

def entry_pinbar(df: pd.DataFrame, e: dict, direction: str) -> pd.Series:
    """
    schemas.Pinbar:
      signal: "bullish" / "bearish"
    """
    o, h, l, c = _ohlc(df)
    body = (c - o).abs()
    upper = h - c.clip(lower=o).where(c >= o, h - o)
    lower = o.clip(lower=c) - l if (c <= o).all() else c.clip(lower=o) - l

    # かなりシンプルな定義: 長いヒゲ + 小さい胴体
    long_lower = (l + (h - l) * 0.2 < o.clip(lower=c))  # 下ヒゲ長め
    long_upper = (h - (h - l) * 0.2 > o.clip(upper=c))  # 上ヒゲ長め
    small_body = body <= (h - l) * 0.3

    bull = (c > o) & long_lower & small_body
    bear = (c < o) & long_upper & small_body

    sig = str(e.get("signal", "bullish")).lower()
    m = bull if sig == "bullish" else bear
    m.iloc[:3] = False
    return m.fillna(False)

def entry_engulfing(df: pd.DataFrame, e: dict, direction: str) -> pd.Series:
    """
    schemas.Engulfing:
      signal: "bullish" / "bearish"
    """
    o, h, l, c = _ohlc(df)
    o1, c1 = o.shift(1), c.shift(1)

    # 前足が陰線・当足が陽線で、当足の実体が前足を包む ≒ bullish
    bull = (c1 < o1) & (c > o) & (c >= o1) & (o <= c1)
    # 逆
    bear = (c1 > o1) & (c < o) & (c <= o1) & (o >= c1)

    sig = str(e.get("signal", "bullish")).lower()
    m = bull if sig == "bullish" else bear
    m.iloc[:2] = False
    return m.fillna(False)

def entry_inside_bar(df: pd.DataFrame, e: dict, direction: str) -> pd.Series:
    """
    Inside Bar: 高値が前足より低く、安値が前足より高い
    """
    o, h, l, c = _ohlc(df)
    h1, l1 = h.shift(1), l.shift(1)
    m = (h < h1) & (l > l1)
    m.iloc[:1] = False
    return m.fillna(False)

def entry_threebar(df: pd.DataFrame, e: dict, direction: str) -> pd.Series:
    """
    超簡易 Three Bar Reversal:
      bullish: 安値更新 → 反発して前々足高値超え
      bearish: 高値更新 → 反落して前々足安値割れ
    """
    o, h, l, c = _ohlc(df)
    sig = str(e.get("signal", "bullish")).lower()

    # index i が 2 本目として扱う（0,1,2 → 3 本）
    low_prev2 = l.shift(2)
    high_prev2 = h.shift(2)

    bull = (l.shift(1) < low_prev2) & (c > high_prev2)
    bear = (h.shift(1) > high_prev2) & (c < l.shift(2))

    m = bull if sig == "bullish" else bear
    m.iloc[:3] = False
    return m.fillna(False)

# ===== ヘッドアンドショルダーズ =====
def entry_head_and_shoulders(df, cfg, direction):
    """
    cfg は schemas.HeadAndShoulders に準拠:
      direction: "reversal" | "continuation"
      entry: "long" | "short"
      option: "neckline" | "none" | "tight"
      side: "long" | "short" | None

    ※ lookback / tolerance_pct はスキーマに無いので固定ロジックで判定
    """
    # ---- 必須フィールド取得 ----
    pattern_dir = cfg["direction"]    # reversal / continuation
    entry_side  = cfg["entry"]        # long / short
    option      = cfg.get("option", "none")

    # ---- シンプルなピーク検出（3点）----
    h = df["high"].values
    peaks = []

    for i in range(1, len(h)-1):
        if h[i] > h[i-1] and h[i] > h[i+1]:
            peaks.append(i)

    if len(peaks) < 3:
        return pd.Series(False, index=df.index)

    L, H, R = peaks[-3], peaks[-2], peaks[-1]

    left = h[L]
    head = h[H]
    right = h[R]

    # 左右の肩の高さ
    shoulder_ok = abs(left - right) / head <= 0.2
    head_ok = head > max(left, right)

    if not (shoulder_ok and head_ok):
        return pd.Series(False, index=df.index)

    # ネックライン
    neck = min(df["low"].iloc[L], df["low"].iloc[R])

    # ---- reversal / continuation の解釈 ----
    if pattern_dir == "reversal":
        cond_break = df["close"] < neck if entry_side == "short" else df["close"] > head
    else:  # continuation
        cond_break = df["close"] > head if entry_side == "long" else df["close"] < neck

    # オプションによる微調整
    if option == "tight":
        cond_break &= df["close"].diff().abs() < (head * 0.002)

    return cond_break.fillna(False)

# === ascending_triangle ===

def entry_ascending_triangle(df, cfg, direction):
    """
    cfg:
      direction: reversal | continuation
      entry: long | short
      option: none | tight | neckline
    """

    h = df["high"].values
    l = df["low"].values

    # lookback はスキーマにないので適当な長さ（50）を内部で設定
    lookback = 50
    if len(h) < lookback:
        return pd.Series(False, index=df.index)

    window_h = h[-lookback:]
    window_l = l[-lookback:]

    top = window_h.max()
    horizontal = (window_h.max() - window_h.min()) / top <= 0.005

    x = np.arange(len(window_l))
    slope = np.polyfit(x, window_l, 1)[0]
    rising = slope > 0

    cond_break = df["close"] > top if cfg["entry"] == "long" else df["close"] < window_l.min()

    # option
    if cfg.get("option") == "tight":
        cond_break &= df["close"].diff().abs() < top * 0.002

    return cond_break.fillna(False)


# === bearish_flag ===

def entry_bear_flag(df, cfg, direction):
    """
    cfg:
      direction: reversal | continuation
      entry: long | short
      option: none | tight
    """

    h = df["high"].values
    l = df["low"].values
    c = df["close"].values

    lookback = 40
    if len(c) < lookback:
        return pd.Series(False, index=df.index)

    # 急落
    ret = (c[-1] - c[-lookback]) / c[-lookback]
    strong_drop = ret < -0.03

    # 上昇チャネル
    x = np.arange(lookback)
    slope_h = np.polyfit(x, h[-lookback:], 1)[0]
    slope_l = np.polyfit(x, l[-lookback:], 1)[0]
    channel_up = slope_h > 0 and slope_l > 0

    # ブレイク
    lower_line = min(l[-lookback:])
    cond_break = df["close"] < lower_line

    if cfg.get("option") == "tight":
        cond_break &= df["close"].diff().abs() < lower_line * 0.002

    return (strong_drop & channel_up & cond_break).fillna(False)




# ===== 2) エントリー条件の実際の真偽数を記録 =====

def _combine_masks(masks: list, logic: str) -> pd.Series:
    """masks を logic に従い AND または OR で結合する。"""
    if not masks:
        return pd.Series(False, index=masks[0].index) if masks else pd.Series(dtype=bool)
    if logic.upper() == "OR":
        out = masks[0].copy()
        for k in masks[1:]:
            out = out | k
        return out.astype(bool)
    out = masks[0].copy()
    for k in masks[1:]:
        out = out & k
    return out.astype(bool)


def _single_entry_mask(df: pd.DataFrame, e: dict, direction: str) -> pd.Series:
    """1つのエントリー条件に対応するマスクを返す。"""
    typ = str(e.get("type", "")).lower()
    if typ == "ema_cross":
        m = entry_ema_cross(df, e, direction)
    elif typ == "rsi_threshold":
        period = int(e.get("period", e.get("length", 14)))
        level  = float(e.get("level", 50))
        ev = str(e.get("event", e.get("mode", "above"))).lower()
        m = entry_rsi_threshold(df, {"period": period, "level": level, "event": ev}, direction)
    elif typ == "breakout":
        m = entry_breakout(df, e, direction)
    elif typ == "sma_cross":
        e2 = {"type": "ema_cross", "fast": e.get("short", 20), "slow": e.get("long", 50), "cross": "above"}
        m = entry_ema_cross(df, e2, direction)
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
    elif typ == "time_window":
        m = entry_time_window(df, e, direction)
    elif typ == "pinbar":
        m = entry_pinbar(df, e, direction)
    elif typ == "engulfing":
        m = entry_engulfing(df, e, direction)
    elif typ == "inside_bar":
        m = entry_inside_bar(df, e, direction)
    elif typ in ("threebar", "three_bar_reversal"):
        m = entry_threebar(df, e, direction)
    elif typ == "head_and_shoulders":
        m = entry_head_and_shoulders(df, e, direction)
    elif typ == "ascending_triangle":
        m = entry_ascending_triangle(df, e, direction)
    elif typ == "bear_flag":
        m = entry_bear_flag(df, e, direction)
    else:
        raise RuntimeError(f"Unsupported entry type: {typ}")
    return m


def build_entry_mask(
    df: pd.DataFrame,
    entries: list,
    direction: str,
    entry_blocks: list | None = None,
    side_filter: str | None = None,
) -> pd.Series:
    """
    entry_blocks が渡された場合: 各ブロック内は logic (AND/OR) で結合、ブロック間は常に AND。
    side_filter が "long" / "short" のときは、ブロック内でその side の条件だけを AND/OR してマスクを出す（direction=both 用）。
    entry_blocks が無い場合: entries をすべて AND で結合（従来どおり）。
    """
    print(f"[ENTRY] building mask direction={direction} side_filter={side_filter}", flush=True)
    if entry_blocks:
        block_masks = []
        for bi, block in enumerate(entry_blocks):
            block_entries = block.get("entries", []) if isinstance(block, dict) else getattr(block, "entries", [])
            logic = (block.get("logic", "AND") if isinstance(block, dict) else getattr(block, "logic", "AND")).upper()
            if not block_entries:
                continue
            # direction=both のとき: ロング用マスクはロング条件だけ、ショート用はショート条件だけでブロック内 AND/OR
            if side_filter in ("long", "short"):
                block_entries = [e for e in block_entries if e.get("side") in (None, side_filter)]
            if not block_entries:
                block_masks.append(pd.Series(False, index=df.index))
                continue
            masks = []
            for i, e in enumerate(block_entries):
                m = _single_entry_mask(df, e, direction)
                print(f"[ENTRY] block#{bi+1} cond#{i+1} type={str(e.get('type','')).lower()} true={int(m.sum())}", flush=True)
                masks.append(m)
            block_mask = _combine_masks(masks, logic)
            block_masks.append(block_mask)
        if not block_masks:
            return pd.Series(False, index=df.index)
        m = _combine_masks(block_masks, "AND")
    else:
        masks = []
        for i, e in enumerate(entries):
            m = _single_entry_mask(df, e, direction)
            print(f"[ENTRY] cond#{i+1} type={str(e.get('type','')).lower()} true={int(m.sum())}", flush=True)
            masks.append(m)
        if not masks:
            return pd.Series(False, index=df.index)
        m = _combine_masks(masks, "AND")

    prev = m.shift(1).fillna(False).astype(bool)
    trans_in  = ((~prev) & m).sum()
    trans_out = (prev & ~m).sum()
    print(f"[ENTRY] final mask: true={int(m.sum())}, entries={int(trans_in)}, exits={int(trans_out)}", flush=True)
    return m.astype(bool)
