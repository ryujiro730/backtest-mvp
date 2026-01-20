# worker/engine/engine.py
import pandas as pd
import numpy as np

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


def run_engine(signal_df, m1_df, cfg):
    trading = cfg.get("trading", {}) or {}

    direction = str(cfg.get("direction", "long")).lower()
    fee = float(cfg.get("fee_bps", 5.0)) / 10000.0
    slip = float(cfg.get("slippage_bps", 0.5)) / 10000.0
    exit_cfg = cfg.get("exit", {}) or {}

    # ========= normalize columns =========
    if "datetime" not in signal_df.columns:
        raise KeyError("signal_df must have 'datetime'")
    if "timestamp" not in signal_df.columns:
        signal_df = signal_df.copy()
        signal_df["timestamp"] = signal_df["datetime"]

    if "datetime" not in m1_df.columns:
        raise KeyError("m1_df must have 'datetime'")

    open_signal = signal_df["open"].astype(float)

    # ========= signal timestamps =========
    ts_signal = signal_df["datetime"]


    # ========= indicators (signal axis) =========
    inds = {
        "close": signal_df["close"].astype(float).values,
        "close_prev": signal_df["close"].astype(float).shift(1).bfill().values,
        "high": signal_df["high"].astype(float).values,
        "low": signal_df["low"].astype(float).values,
    }

    for n in (14, 20, 22, 50):
        inds[f"atr_{n}"] = atr(signal_df, n).values
    for n in (10, 20, 50, 200):
        inds[f"ema_{n}"] = ema(signal_df["close"].astype(float), n).values
    for n in (7, 14, 21):
        inds[f"rsi_{n}"] = rsi(signal_df["close"].astype(float), n).values

    macd_line, sig, _ = macd(signal_df["close"].astype(float))
    inds["macd"] = macd_line.values
    inds["macd_signal"] = sig.values

    # ========= entry masks =========
    pos_mask = build_entry_mask(signal_df, cfg.get("entries", []), direction)
    pos_mask.iloc[:5] = 0

    opp_dir = "short" if direction == "long" else "long"
    pos_mask_opposite = build_entry_mask(signal_df, cfg.get("entries", []), opp_dir)
    pos_mask_opposite.iloc[:5] = 0

    strat_ret = pd.Series(0.0, index=signal_df.index, dtype=float)
    trades = []

    in_pos = False
    pos = None

    # ========= helper =========
    def _close_at_signal_exit(signal_i: int):
        cur_ts = signal_df["datetime"].iat[signal_i]

        idx = int(m1_df["datetime"].searchsorted(cur_ts))
        if idx + 1 >= len(m1_df):
            return

        exit_m1_idx = idx + 1
        _close_position(exit_m1_idx, exit_reason="signal")

        strat_ret.iat[signal_i + 1] += pnl
        in_pos = False
        pos = None

    # ========= main loop (signal axis) =========
    for i in range(1, len(signal_df) - 1):
        prev = int(pos_mask.iat[i - 1])
        curr = int(pos_mask.iat[i])

        # -------------------------
        # ENTRY (signal axis)
        # -------------------------
        if (not in_pos) and prev == 0 and curr == 1:
            in_pos = True

            entry_time = signal_df["datetime"].iat[i + 1]
            entry_px = float(open_signal.iat[i + 1])

            # M1 start index
            m1_start_idx = int(m1_df["datetime"].searchsorted(entry_time))
            if m1_start_idx >= len(m1_df) - 1:
                print(
                    "[SKIP ENTRY] no M1 data",
                    "entry_time=", entry_time,
                    "m1_start_idx=", m1_start_idx,
                    "m1_len=", len(m1_df),
                    flush=True
                )
                in_pos = False
                pos = None
                continue

            sl, R = _initial_r_and_sl(
                entry_px,
                direction,
                signal_df,
                i,
                exit_cfg.get("sl_atr"),
                exit_cfg.get("sl_fixed_pips"),
            )
            tp = _tp_price(
                entry_px,
                direction,
                R,
                exit_cfg.get("tp_r_multiple"),
                None,
            )

            pos = {
                "side": direction,
                "entry_px": entry_px,
                "entry_time": entry_time,
                "stop": sl,
                "tp": tp,
                "R": R,
                "signal_i": i,  # entryが成立したsignal index
                "entry_m1_idx": m1_start_idx,
            }
            pos["entry_time_m1"] = m1_df["datetime"].iat[m1_start_idx]

            # entry costs（signal軸に積む）
            strat_ret.iat[i + 1] -= (fee + slip)

            # -------------------------
            # EXIT loop (M1 axis)  ← entry直後にだけ見る（SL/TP/%/minutes）
            # -------------------------
            long_side = (pos["side"] == "long")

            def _close_position(exit_m1_idx: int, *, exit_reason: str):
                nonlocal in_pos, pos

                exit_ts = m1_df["datetime"].iat[exit_m1_idx]
                exit_px = float(m1_df["open"].iat[exit_m1_idx])

                long_side = (pos["side"] == "long")
                pnl = (
                    (exit_px / pos["entry_px"] - 1.0)
                    if long_side
                    else (pos["entry_px"] / exit_px - 1.0)
                )
                pnl -= fee

                bars_held = exit_m1_idx - pos["entry_m1_idx"]

                trades.append(
                    {
                        "entry_time": str(pos["entry_time"]),
                        "exit_time": str(exit_ts),
                        "hold_minutes": bars_held,
                        "entry": float(pos["entry_px"]),
                        "exit": float(exit_px),
                        "pnl": float(pnl),
                        "exit_reason": exit_reason,
                    }
                )

                strat_ret.iat[i + 1] += pnl
                in_pos = False
                pos = None

            for j in range(m1_start_idx, len(m1_df) - 1):
                hi = float(m1_df["high"].iat[j])
                lo = float(m1_df["low"].iat[j])
                now_ts = m1_df["datetime"].iat[j]

                # (1) Hard SL (intrabar)
                if pos.get("stop") is not None and _hit_stop(long_side, hi, lo, pos["stop"]):
                    raw_px = float(pos["stop"])
                    exit_m1_idx = j + 1
                    _close_position(exit_m1_idx, exit_reason="sl")
                    break

                # (1b) Hard TP (intrabar)
                if pos.get("tp") is not None:
                    hit_tp = (hi >= pos["tp"]) if long_side else (lo <= pos["tp"])
                    if hit_tp:
                        raw_px = float(pos["tp"])
                        exit_m1_idx = j + 1
                        _close_position(exit_m1_idx, exit_reason="tp")
                        break

                # (2) % SL/TP (intrabar)
                if "sl_pct" in exit_cfg:
                    slp = float(exit_cfg["sl_pct"])
                    if long_side and lo <= pos["entry_px"] * (1.0 - slp):
                        exit_m1_idx = j + 1
                        _close_position(exit_m1_idx, exit_reason="sl")
                        break
                    if (not long_side) and hi >= pos["entry_px"] * (1.0 + slp):
                        exit_m1_idx = j + 1
                        _close_position(exit_m1_idx, exit_reason="sl")
                        break

                if "tp_pct" in exit_cfg:
                    tpp = float(exit_cfg["tp_pct"])
                    if long_side and hi >= pos["entry_px"] * (1.0 + tpp):
                        exit_m1_idx = j + 1
                        _close_position(exit_m1_idx, exit_reason="tp")
                        break
                    if (not long_side) and lo <= pos["entry_px"] * (1.0 - tpp):
                        exit_m1_idx = j + 1
                        _close_position(exit_m1_idx, exit_reason="tp")
                        break

                # (3) time-stop minutes (M1 time based)
                tsm = exit_cfg.get("time_stop_minutes")
                if tsm is not None:
                    bars_held = j - pos["entry_m1_idx"]
                    if bars_held >= int(tsm):
                        exit_m1_idx = j + 1
                        _close_position(exit_m1_idx, exit_reason="time_stop")
                        break

        # =========================
        # LOGIC EXITS (signal axis)  ← entryの外。保有中は毎バー判定
        # =========================
        if not in_pos:
            continue

        # entryしたバーでは signal-exit を評価しない（即死防止）
        if i <= pos["signal_i"]:
            continue



        # (B) opposite signal
        if exit_cfg.get("opposite_signal_exit"):
            if int(pos_mask_opposite.iat[i]) == 1:
                _close_at_signal_exit(i, signal_df["datetime"].iat[i])
                continue

        # (C) time_stop_bars
        tsb = exit_cfg.get("time_stop_bars")
        if tsb is not None:
            if (i - pos["signal_i"]) >= int(tsb):
                _close_at_signal_exit(i, signal_df["datetime"].iat[i])
                continue


    # ========= finalize =========
    equity = (1 + strat_ret).cumprod()

    # summary
    pnls = [t["pnl"] for t in trades]
    gp = sum(p for p in pnls if p > 0)
    gl = -sum(p for p in pnls if p < 0)
    pf = (gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
    winrate = (sum(1 for p in pnls if p > 0) / len(pnls)) if pnls else 0.0

    # max drawdown
    peak = 0.0
    maxdd = 0.0
    for e in equity.values:
        e = float(e)
        if e > peak:
            peak = e
        if peak > 0:
            maxdd = max(maxdd, 1.0 - e / peak)

    summary = {
        "pf": round(pf, 4),
        "winrate": round(winrate, 4),
        "maxdd": round(maxdd, 4),
        "trades": len(trades),
    }

    equity_list = [{"t": str(ts_signal.iat[k]), "e": float(equity.iat[k])} for k in range(len(equity))]

    return {"summary": summary, "equity": equity_list, "trades": trades}

    
def run_backtest_logic(run_id, sid, seed, code_hash, dataset_hash):
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

        raw_trading = raw.get("trading", {}) or {}
        engine_cfg = {
            "direction": direction,
            "fee_bps": fee_bps,
            "slippage_bps": slip_bps,
            "entries": entries,
            "exit": exit_cfg,
            "trading": raw_trading
        }

        df = _load_prices(dataset_hash)
        print(df.dtypes)
        print(df.head())
        print("unique close:", len(df['close'].unique()))
        print("sorted:", df['datetime'].is_monotonic_increasing)

        if direction in ("long", "short"):
            engine_cfg["entries"] = [e for e in entries if (e.get("side") in (None, direction))]

        if direction == "both":
            long_entries  = [e for e in entries if (e.get("side") in (None, "long"))]
            short_entries = [e for e in entries if (e.get("side") in (None, "short"))]

            cfg_long  = {**engine_cfg, "direction": "long", "entries": long_entries}
            cfg_short = {**engine_cfg, "direction": "short", "entries": short_entries}

            out_long  = run_engine(signal_df, m1_df, cfg_long)
            out_short = run_engine(signal_df, m1_df, cfg_short)

            trades = out_long["trades"] + out_short["trades"]

            eq_long  = {e["t"]: e["e"] for e in out_long["equity"]}
            eq_short = {e["t"]: e["e"] for e in out_short["equity"]}

            merged = [{"t": t, "e": eq_long[t] * eq_short.get(t, 1.0)} for t in eq_long.keys()]

            pnls = [t["pnl"] for t in trades]
            gp = sum(p for p in pnls if p > 0.0)
            gl = -sum(p for p in pnls if p < 0.0)
            pf = (gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
            winrate = (sum(1 for p in pnls if p > 0) / len(pnls)) if pnls else 0.0

            maxdd = 0.0
            peak = 0.0
            for e in merged:
                peak = max(peak, e["e"])
                if peak > 0:
                    maxdd = max(maxdd, 1 - (e["e"]/peak))

            summary = {
                "pf": round(pf,4),
                "winrate": round(winrate,4),
                "maxdd": round(maxdd,4),
                "trades": len(trades)
            }

            out = {"summary": summary, "equity": merged, "trades": trades}

        else:
            out = run_engine(signal_df, m1_df, engine_cfg)

        # DB 更新
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

        # ローカル保存
        save_result(run_id, s, out["equity"], out.get("trades", []))

        return out["summary"]

    except Exception as e:
        # 失敗時は DB にエラーを書き込む
        with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
            cur.execute(
                """
                update runs
                   set status='error', finished_at=now(),
                       error=%s
                 where run_id=%s
                """,
                (str(e), run_id),
            )
            conn.commit()
        raise
