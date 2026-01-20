# worker/engine/exit.py
import pandas as pd
import numpy as np
from .indicators import atr, macd, bbands, stochastic, cci, adx, vwap, supertrend


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
