# worker/engine/engine.py
import sys
import time
import pandas as pd
import numpy as np

try:
    import engine_rs
    HAS_ENGINE_RS = True
except ImportError:
    engine_rs = None
    HAS_ENGINE_RS = False

if HAS_ENGINE_RS:
    import sys
    print("[engine] engine_rs (Rust extension) loaded.", file=sys.stderr, flush=True)

from .entry import build_entry_mask
from .exit import (
    _initial_r_and_sl,
    _tp_price,
    _hit_stop,
    _trail_breakeven,
    _trail_atr,
    _indicator_exit_hit
)
from .indicators import atr, ema, rsi, macd, bbands


# FX 1標準ロット = 100,000 通貨単位（共通）
CONTRACT_SIZE = 100_000.0

# レスポンス用 equity の最大点数（超えたら間引く。フロントは表示でさらに2500点にしているので見た目・分析はほぼ同じ）
MAX_EQUITY_POINTS_RESPONSE = 5000


def _equity_list_for_response(ts, equity_series, max_points=MAX_EQUITY_POINTS_RESPONSE):
    """equity を max_points を超えないように間引いた [{"t": ..., "e": ...}] を返す。"""
    n = len(equity_series)
    if n <= max_points:
        return [{"t": str(ts.iat[k]), "e": float(equity_series.iat[k])} for k in range(n)]
    step = n / max_points
    indices = [min(int(i * step), n - 1) for i in range(max_points)]
    if n > 0 and indices[-1] != n - 1:
        indices.append(n - 1)
    return [{"t": str(ts.iat[k]), "e": float(equity_series.iat[k])} for k in indices]


def _pip_size(pair: str) -> float:
    """通貨ペアに応じた 1 pip の価格幅。"""
    p = (pair or "").upper()
    if "JPY" in p:
        return 0.01
    return 0.0001


def _bar_minutes(timeframe: str) -> float:
    """タイムフレームの 1 本の分数。"""
    tf = (timeframe or "H1").upper()
    if tf == "M1":
        return 1.0
    if tf == "M15":
        return 15.0
    if tf == "H1":
        return 60.0
    if tf == "H4":
        return 240.0
    return 60.0


def _max_drawdown(equity):
    """
    equity: pd.Series または 1次元配列
    最大ドローダウン率（0〜1）を返す
    """
    peak = 0.0
    maxdd = 0.0

    for e in equity:
        e = float(e)
        if e > peak:
            peak = e
        if peak > 0:
            dd = 1.0 - e / peak
            if dd > maxdd:
                maxdd = dd

    return maxdd


def _can_use_rust(exit_cfg: dict, pyramid: bool) -> bool:
    """Rust パスを使える条件: 積み増しなし・SL固定pips・TP R倍・反対/時間ストップのみ"""
    if pyramid:
        return False
    if not exit_cfg:
        return True
    if exit_cfg.get("candle_exit") or exit_cfg.get("trail_pips") or exit_cfg.get("indicator_exit") or exit_cfg.get("forced_exit"):
        return False
    if exit_cfg.get("sl_atr") and not exit_cfg.get("sl_fixed_pips"):
        return False  # Rust は sl_fixed_pips のみ対応
    return True


def run_engine(df, cfg):
    t0 = time.perf_counter()
    trading = cfg.get("trading", {}) or {}

    initial_balance = float(trading.get("balance", 100000))
    spread_pips = float(trading.get("spread", 1.5))
    slippage_pips = float(trading.get("slippage", 0.5))
    commission = float(trading.get("commission", 7))  # 円/lot 往復想定（エントリー+エグジットで 2 回分）
    swap = float(trading.get("swap", 0))  # 円/lot/日。正＝受け取り(クレジット)、負＝支払い(デビット)
    leverage = float(trading.get("leverage", 100))
    margin_call_pct = float(trading.get("margin_call", 100))
    lot_mode = str(trading.get("lot_mode", "fixed")).lower()
    lot_size = float(trading.get("lot_size", 0.1))
    risk_pct = float(trading.get("risk_pct", 1.0))

    # ロットモード: fixed = 常に一定ロット, dynamic = 残高に比例（複利）
    if lot_mode not in ("fixed", "dynamic"):
        lot_mode = "fixed"
    if lot_size <= 0:
        lot_size = 0.01
    if initial_balance <= 0:
        initial_balance = 100000.0

    pair = str(cfg.get("pair", "EURUSD"))
    timeframe = str(cfg.get("timeframe", "H1"))
    pip_size = _pip_size(pair)
    bar_minutes = _bar_minutes(timeframe)

    # --- ensure timestamp exists ---
    if "timestamp" not in df.columns:
        if "datetime" in df.columns:
            df["timestamp"] = df["datetime"]
        else:
            raise KeyError("Neither 'timestamp' nor 'datetime' column found in df")

    direction = str(cfg.get("direction", "long")).lower()
    pyramid = bool(trading.get("pyramid", False))  # True: シグナルごとに積み増しエントリー
    # フォールバック: fee_bps / slippage_bps は trading 未指定時用
    fee_bps = float(cfg.get("fee_bps", 5.0))
    slip_bps = float(cfg.get("slippage_bps", 0.5))
    fee = fee_bps / 10000.0
    slip = slip_bps / 10000.0
    exit_cfg = cfg.get("exit", {}) or {}

    # after ensuring timestamp exists
    ts = df["timestamp"]
    openp = df["open"].astype(float)
    close = df["close"].astype(float)

    t_entry = time.perf_counter()
    entry_blocks = cfg.get("entry_blocks")
    pos_mask = build_entry_mask(
        df, cfg.get("entries", []), direction,
        entry_blocks=entry_blocks,
        side_filter=direction if entry_blocks else None,
    )
    pos_mask.iloc[:5] = False  # warmup
    opp_dir = "short" if direction == "long" else "long"
    pos_mask_opposite = build_entry_mask(
        df, cfg.get("entries", []), opp_dir,
        entry_blocks=entry_blocks,
        side_filter=opp_dir if entry_blocks else None,
    )
    pos_mask_opposite.iloc[:5] = False
    t_entry_done = time.perf_counter()

    # Rust パス: inds は使わないのでスキップし、numpy をそのまま渡してコピー削減
    if HAS_ENGINE_RS and _can_use_rust(exit_cfg, pyramid):
        try:
            sl_pips = exit_cfg.get("sl_fixed_pips")
            if sl_pips is not None:
                sl_pips = float(sl_pips)
            tp_r = exit_cfg.get("tp_r_multiple")
            if tp_r is not None:
                tp_r = float(tp_r)
            tsb = exit_cfg.get("time_stop_bars")
            if tsb is not None:
                tsb = int(tsb)
            sl_tsb = exit_cfg.get("sl_time_stop_bars")
            if sl_tsb is not None:
                sl_tsb = int(sl_tsb)
            tp_tsb = exit_cfg.get("tp_time_stop_bars")
            if tp_tsb is not None:
                tp_tsb = int(tp_tsb)
            opp_exit = bool(exit_cfg.get("opposite_signal_exit", False))
            commission_rt = 2.0 * float(trading.get("commission", 7))

            t_prep = time.perf_counter()
            open_arr = np.ascontiguousarray(openp.astype(np.float64), dtype=np.float64)
            high_arr = np.ascontiguousarray(df["high"].astype(np.float64), dtype=np.float64)
            low_arr = np.ascontiguousarray(df["low"].astype(np.float64), dtype=np.float64)
            close_arr = np.ascontiguousarray(close.astype(np.float64), dtype=np.float64)
            em = np.ascontiguousarray(pos_mask.astype(np.uint8), dtype=np.uint8)
            em_opp = np.ascontiguousarray(pos_mask_opposite.astype(np.uint8), dtype=np.uint8)
            t_prep_done = time.perf_counter()

            equity_rust, trades_rust = engine_rs.run_engine_core(
                open_arr,
                high_arr,
                low_arr,
                close_arr,
                em,
                em_opp,
                direction == "long",
                lot_size,
                pip_size,
                spread_pips,
                slippage_pips,
                sl_pips,
                tp_r,
                tsb,
                sl_tsb,
                tp_tsb,
                opp_exit,
                initial_balance,
                commission_rt,
            )
            t_rust_done = time.perf_counter()

            equity = pd.Series(equity_rust, index=df.index)
            pnls = [float(t[2]) for t in trades_rust]
            gp = sum(p for p in pnls if p > 0)
            gl = -sum(p for p in pnls if p < 0)
            pf = (gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
            winrate = (sum(1 for p in pnls if p > 0) / len(pnls)) if pnls else 0.0
            maxdd = _max_drawdown(equity)
            trades = [
                {
                    "entry_time": str(ts.iat[int(t[0])]),
                    "exit_time": str(ts.iat[int(t[1])]),
                    "entry": float(t[3]),
                    "exit": float(t[4]),
                    "pnl": float(t[2]),
                }
                for t in trades_rust
            ]
            total = time.perf_counter() - t0
            print(
                f"[perf] run_engine(Rust) total={total:.3f}s entry_mask={t_entry_done-t_entry:.3f}s prep={t_prep_done-t_prep:.3f}s rust={t_rust_done-t_prep_done:.3f}s",
                file=sys.stderr,
                flush=True,
            )
            return {
                "summary": {
                    "pf": round(pf, 4),
                    "winrate": round(winrate, 4),
                    "maxdd": round(maxdd, 4),
                    "trades": len(trades),
                },
                "equity": _equity_list_for_response(ts, equity),
                "trades": trades,
            }
        except Exception as e:
            print(f"[engine] Rust path failed, falling back to Python: {e}", file=sys.stderr, flush=True)

    # Python パス: 指標を計算してからバーループ
    t_inds = time.perf_counter()
    inds = {
        "close": df["close"].astype(float).values,
        "close_prev": df["close"].astype(float).shift(1).bfill().values,
        "high": df["high"].astype(float).values,
        "low": df["low"].astype(float).values,
    }
    for n in (14, 20, 22, 50):
        inds[f"atr_{n}"] = atr(df, n).values
    for n in (10, 20, 50, 200):
        inds[f"ema_{n}"] = ema(df["close"].astype(float), n).values
    for n in (7, 14, 21):
        inds[f"rsi_{n}"] = rsi(df["close"].astype(float), n).values
    for n, k in ((20, 2.0), (20, 1.5)):
        lo, mid, up = bbands(df["close"].astype(float), n, k)
        inds[f"bb_lo_{n}_{k}"] = lo.values
        inds[f"bb_mid_{n}_{k}"] = mid.values
        inds[f"bb_up_{n}_{k}"] = up.values
    for n in (20, 22):
        inds[f"hh_{n}"] = df["high"].rolling(n).max().values
        inds[f"ll_{n}"] = df["low"].rolling(n).min().values
    macd_line, sig, hist = macd(df["close"].astype(float))
    inds["macd"] = macd_line.values
    inds["macd_signal"] = sig.values
    t_inds_done = time.perf_counter()
    t_loop_start = time.perf_counter()

    # すべての損益は、エントリー/イグジットイベント時にのみ積む
    strat_ret = pd.Series(0.0, index=df.index, dtype=float)
    # ロットモード用: 現在残高（クロージャで更新するためリストで保持）
    balance_ref = [initial_balance]

    trades = []
    positions = []  # 積み増し時は複数、通常は 0 または 1

    def _close_one_position(po: dict, exit_px: float, exit_bar_i: int):
        """1ポジションを決済してリストから削除"""
        nonlocal positions
        ep = po["entry_px"]
        ei = po["entry_idx"]
        ls = (po["side"] == "long")
        if ls:
            price_return = (exit_px / ep - 1.0)
        else:
            price_return = (ep / exit_px - 1.0)
        balance_at_entry = po.get("balance_at_entry") or initial_balance
        position_notional = po.get("position_notional") or (lot_size * CONTRACT_SIZE)
        lots = position_notional / CONTRACT_SIZE
        commission_money = 2.0 * commission * lots
        bars_held = exit_bar_i - ei + 1
        days_held = bars_held * bar_minutes / (24.0 * 60.0)
        swap_amount = swap * lots * max(0.0, days_held)
        pnl_money = price_return * position_notional - commission_money + swap_amount
        balance_ref[0] += pnl_money
        pnl_for_equity = (pnl_money / balance_at_entry) if balance_at_entry > 0 else 0.0
        trades.append({
            "entry_time": str(ts.iat[ei]),
            "exit_time": str(ts.iat[exit_bar_i + 1]),
            "entry": float(ep),
            "exit": float(exit_px),
            "pnl": float(pnl_for_equity),
        })
        positions = [p for p in positions if p is not po]
        strat_ret.iat[exit_bar_i + 1] += pnl_for_equity

    for i in range(1, len(df) - 1):
        prev = int(pos_mask.iat[i - 1])
        curr = int(pos_mask.iat[i])
        long_side = (direction == "long")
        hi = float(df["high"].iat[i])
        lo = float(df["low"].iat[i])

        # === ENTRY ===
        # 積み増しON: シグナル(0→1)のたびに追加。OFF: ポジションが無いときだけエントリー
        if prev == 0 and curr == 1:
            if pyramid or len(positions) == 0:
                raw_entry = float(openp.iat[i + 1])
                cost_pips = (spread_pips + slippage_pips) * pip_size
                if direction == "long":
                    entry_px = raw_entry + cost_pips
                else:
                    entry_px = raw_entry - cost_pips
                sl, R = _initial_r_and_sl(entry_px, direction, df, i, exit_cfg.get("sl_atr"), exit_cfg.get("sl_fixed_pips"))
                tp = _tp_price(entry_px, direction, R, exit_cfg.get("tp_r_multiple"), None)
                balance_at_entry = balance_ref[0]
                if lot_mode == "fixed":
                    position_notional = lot_size * CONTRACT_SIZE
                else:
                    position_notional = lot_size * CONTRACT_SIZE * (balance_at_entry / initial_balance)
                max_notional = balance_at_entry * leverage
                position_notional = min(position_notional, max_notional)
                position_notional = max(0.0, position_notional)
                pos = {
                    "side": direction, "entry_px": entry_px, "entry_idx": i,
                    "stop": sl, "tp": tp, "R": R, "df": df,
                    "balance_at_entry": balance_at_entry,
                    "position_notional": position_notional,
                }
                positions.append(pos)
            continue

        # === EXIT（各ポジションごとに SL/TP 等を判定）===
        if not positions:
            continue

        # 「全決済」条件（反対シグナル・強制ウィンドウ・ローソク足）用
        mkt_px = float(openp.iat[i + 1])
        slip_rate_ref = (slippage_pips * pip_size) / max(positions[0]["entry_px"], 1e-9)
        close_all_px = mkt_px * (1.0 - slip_rate_ref) if long_side else mkt_px * (1.0 + slip_rate_ref)

        if exit_cfg.get("opposite_signal_exit") and int(pos_mask_opposite.iat[i]) == 1:
            for _ in range(len(positions)):
                _close_one_position(positions[0], close_all_px, i)
            continue

        fe = exit_cfg.get("forced_exit")
        if fe:
            now_ts = pd.to_datetime(ts.iat[i])
            fe_start, fe_end = fe.get("start"), fe.get("end")
            in_window = (fe_start is not None and now_ts >= pd.to_datetime(fe_start)) or (fe_end is not None and now_ts >= pd.to_datetime(fe_end))
            if in_window:
                for _ in range(len(positions)):
                    _close_one_position(positions[0], close_all_px, i)
                continue

        # ローソク足 EXIT（全決済）
        candle_cfgs = exit_cfg.get("candle_exit") or []
        if candle_cfgs and positions:
            o_cur = float(df["open"].iat[i])
            c_cur = float(df["close"].iat[i])
            h_cur = hi
            l_cur = lo
            body = abs(c_cur - o_cur)
            upper_wick = h_cur - max(o_cur, c_cur)
            lower_wick = min(o_cur, c_cur) - l_cur
            for c in candle_cfgs:
                entry_side = c.get("entrySide")
                if entry_side and entry_side != positions[0].get("side"):
                    continue
                pat = c.get("pattern")
                sig = c.get("signal")
                matched = False
                if pat == "pinbar":
                    if sig == "bullish":
                        matched = (lower_wick > body * 2.0 and upper_wick < body)
                    elif sig == "bearish":
                        matched = (upper_wick > body * 2.0 and lower_wick < body)
                elif pat == "engulfing" and i > 0:
                    o_prev = float(df["open"].iat[i - 1])
                    c_prev = float(df["close"].iat[i - 1])
                    if sig == "bullish":
                        matched = (c_prev < o_prev and c_cur > o_cur and c_cur >= o_prev and o_cur <= c_prev)
                    elif sig == "bearish":
                        matched = (c_prev > o_prev and c_cur < o_cur and c_cur <= o_prev and o_cur >= c_prev)
                elif pat == "inside" and i > 0:
                    h_prev = float(df["high"].iat[i - 1])
                    l_prev = float(df["low"].iat[i - 1])
                    matched = (h_cur <= h_prev and l_cur >= l_prev)
                if matched:
                    for _ in range(len(positions)):
                        _close_one_position(positions[0], close_all_px, i)
                    break
            if not positions:
                continue

        # ポジションごとにマージン・SL/TP・指標EXIT・トレール・時間ストップを判定（1本決済したら次バーへ）
        closed_this_bar = False
        total_notional = sum(p.get("position_notional") or (lot_size * CONTRACT_SIZE) for p in positions)
        margin_used = total_notional / leverage
        if margin_used > 0 and balance_ref[0] / margin_used * 100.0 < margin_call_pct:
            for _ in range(len(positions)):
                _close_one_position(positions[0], close_all_px, i)
            continue

        for po in list(positions):
            if not positions:
                break
            entry_px = po["entry_px"]
            entry_idx = po["entry_idx"]
            slip_rate = (slippage_pips * pip_size) / max(entry_px, 1e-9)

            if po.get("stop") is not None and _hit_stop(long_side, hi, lo, po["stop"]):
                exit_px = float(po["stop"]) * (1.0 - slip_rate) if long_side else float(po["stop"]) * (1.0 + slip_rate)
                _close_one_position(po, exit_px, i)
                closed_this_bar = True
                break
            if po.get("tp") is not None:
                hit_tp = (hi >= po["tp"]) if long_side else (lo <= po["tp"])
                if hit_tp:
                    exit_px = float(po["tp"]) * (1.0 - slip_rate) if long_side else float(po["tp"]) * (1.0 + slip_rate)
                    _close_one_position(po, exit_px, i)
                    closed_this_bar = True
                    break
            if "sl_pct" in exit_cfg:
                slp = float(exit_cfg["sl_pct"])
                if long_side and lo <= entry_px * (1.0 - slp):
                    _close_one_position(po, entry_px * (1.0 - slp), i)
                    closed_this_bar = True
                    break
                if not long_side and hi >= entry_px * (1.0 + slp):
                    _close_one_position(po, entry_px * (1.0 + slp), i)
                    closed_this_bar = True
                    break
            if "tp_pct" in exit_cfg:
                tpp = float(exit_cfg["tp_pct"])
                if long_side and hi >= entry_px * (1.0 + tpp):
                    _close_one_position(po, entry_px * (1.0 + tpp), i)
                    closed_this_bar = True
                    break
                if not long_side and lo <= entry_px * (1.0 - tpp):
                    _close_one_position(po, entry_px * (1.0 - tpp), i)
                    closed_this_bar = True
                    break
            ind_cfg = exit_cfg.get("indicator_exit")
            if ind_cfg is not None and _indicator_exit_hit(po, i, inds, ind_cfg):
                exit_px = mkt_px * (1.0 - slip_rate) if long_side else mkt_px * (1.0 + slip_rate)
                _close_one_position(po, exit_px, i)
                closed_this_bar = True
                break
        if closed_this_bar:
            continue

        # トレーリング（各ポジションの stop を更新）
        trail_conf = exit_cfg.get("trail_pips")
        if trail_conf:
            activate_pips = float(trail_conf.get("activate", 0.0))
            trail_pips_val = float(trail_conf.get("trail", 0.0))
            if activate_pips > 0 and trail_pips_val > 0:
                activate_dist = activate_pips * pip_size
                trail_dist = trail_pips_val * pip_size
                last_close = float(close.iat[i])
                for po in positions:
                    ep = po["entry_px"]
                    if long_side:
                        if last_close - ep >= activate_dist:
                            new_stop = last_close - trail_dist
                            if po.get("stop") is None or new_stop > po["stop"]:
                                po["stop"] = new_stop
                    else:
                        if ep - last_close >= activate_dist:
                            new_stop = last_close + trail_dist
                            if po.get("stop") is None or new_stop < po["stop"]:
                                po["stop"] = new_stop

        # 時間ストップ（ポジションごと）
        for po in list(positions):
            if not positions:
                break
            bars_held = i - po["entry_idx"]
            slip_rate = (slippage_pips * pip_size) / max(po["entry_px"], 1e-9)
            exit_px = mkt_px * (1.0 - slip_rate) if long_side else mkt_px * (1.0 + slip_rate)
            sl_tsbars = exit_cfg.get("sl_time_stop_bars")
            tp_tsbars = exit_cfg.get("tp_time_stop_bars")
            tsbars = exit_cfg.get("time_stop_bars")
            if sl_tsbars is not None and bars_held >= int(sl_tsbars):
                _close_one_position(po, exit_px, i)
                closed_this_bar = True
                break
            if tp_tsbars is not None and bars_held >= int(tp_tsbars):
                _close_one_position(po, exit_px, i)
                closed_this_bar = True
                break
            if tsbars is not None and bars_held >= int(tsbars):
                _close_one_position(po, exit_px, i)
                closed_this_bar = True
                break
    # === finalize equity ===
    equity = (1 + strat_ret).cumprod()

    # === summary ===
    pnls = [t["pnl"] for t in trades]
    gp = sum(p for p in pnls if p > 0)
    gl = -sum(p for p in pnls if p < 0)
    pf = (gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
    winrate = (sum(1 for p in pnls if p > 0) / len(pnls)) if pnls else 0.0
    maxdd = _max_drawdown(equity)

    summary = {
        "pf": round(pf, 4),
        "winrate": round(winrate, 4),
        "maxdd": round(maxdd, 4),
        "trades": len(trades),
    }

    t_loop_done = time.perf_counter()
    total = time.perf_counter() - t0
    print(
        f"[perf] run_engine(Python) total={total:.3f}s entry_mask={t_entry_done-t_entry:.3f}s inds={t_inds_done-t_inds:.3f}s loop={t_loop_done-t_loop_start:.3f}s",
        file=sys.stderr,
        flush=True,
    )

    # === equity JSON 形式変換（多バー時は間引いてレスポンスを軽くする）===
    equity_list = _equity_list_for_response(ts, equity)

    return {
        "summary": summary,
        "equity": equity_list,
        "trades": trades,
    }
    
# 実装は worker/engine/run_logic.py に一本化（entry_blocks / AND・OR 対応）。
# タスクは tasks.run_backtest → run_logic.run_backtest_logic を呼ぶ。
