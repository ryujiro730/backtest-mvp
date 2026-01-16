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


def run_engine(df, cfg):
    trading = cfg.get("trading", {}) or {}

    balance = float(trading.get("balance", 100000))
    spread = float(trading.get("spread", 1.5))
    slippage = float(trading.get("slippage", 0.5))
    commission = float(trading.get("commission", 7))
    leverage = float(trading.get("leverage", 100))
    margin_call = float(trading.get("margin_call", 100))
    lot_mode = trading.get("lot_mode", "fixed")
    lot_size = float(trading.get("lot_size", 0.1))
    risk_pct = float(trading.get("risk_pct", 1.0))

    # --- added: ensure timestamp exists ---
    if "timestamp" not in df.columns:
        if "datetime" in df.columns:
            df["timestamp"] = df["datetime"]
        else:
            raise KeyError("Neither 'timestamp' nor 'datetime' column found in df")

    direction = str(cfg.get("direction", "long")).lower()
    fee = float(cfg.get("fee_bps", 5.0)) / 10000.0
    slip = float(cfg.get("slippage_bps", 0.5)) / 10000.0
    exit_cfg = cfg.get("exit", {}) or {}

    # after ensuring timestamp exists
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
            tp = _tp_price(entry_px, direction, R, exit_cfg.get("tp_r_multiple"), None)
            pos = {"side": direction, "entry_px": entry_px, "entry_idx": i, "stop": sl, "tp": tp, "R": R, "df": df}
            # 手数料（エントリー分）
            strat_ret.iat[i+1] -= (fee + slip)
            continue
        # === EXIT ===
        if in_pos:
            long_side = (direction == "long")
            hi = float(df["high"].iat[i])
            lo = float(df["low"].iat[i])

            # ---- 共通で使うヘルパー：ポジションクローズ ----
            def _close_position(exit_px: float):
                nonlocal in_pos, entry_px, entry_idx, pos
                # pnl 計算（long/short 共通）
                if long_side:
                    pnl = (exit_px / entry_px - 1.0)
                else:
                    pnl = (entry_px / exit_px - 1.0)
                pnl -= fee

                trades.append({
                    "entry_time": str(ts.iat[entry_idx]),
                    "exit_time": str(ts.iat[i+1]),
                    "entry": float(entry_px),
                    "exit": float(exit_px),
                    "pnl": float(pnl),
                })

                in_pos = False
                entry_px = None
                entry_idx = None
                pos = None
                strat_ret.iat[i+1] += pnl

            #
            # (1) ハードSL intrabar （pos["stop"]）
            #
            if pos.get("stop") is not None and _hit_stop(long_side, hi, lo, pos["stop"]):
                raw_px = float(pos["stop"])
                exit_px = raw_px * (1.0 - slip) if long_side else raw_px * (1.0 + slip)
                _close_position(exit_px)
                continue

            #
            # (1b) ハードTP intrabar （pos["tp"]）
            #
            if pos.get("tp") is not None:
                hit_tp = (hi >= pos["tp"]) if long_side else (lo <= pos["tp"])
                if hit_tp:
                    raw_px = float(pos["tp"])
                    exit_px = raw_px * (1.0 - slip) if long_side else raw_px * (1.0 + slip)
                    _close_position(exit_px)
                    continue

            #
            # (2) %ベース SL/TP （sl_pct / tp_pct）
            #     normalize_exit で 0.01 (=1%) のような小数にしてある前提
            #
            if "sl_pct" in exit_cfg:
                slp = float(exit_cfg["sl_pct"])
                if long_side and lo <= entry_px * (1.0 - slp):
                    exit_px = entry_px * (1.0 - slp)
                    _close_position(exit_px)
                    continue
                if not long_side and hi >= entry_px * (1.0 + slp):
                    exit_px = entry_px * (1.0 + slp)
                    _close_position(exit_px)
                    continue

            if "tp_pct" in exit_cfg:
                tpp = float(exit_cfg["tp_pct"])
                if long_side and hi >= entry_px * (1.0 + tpp):
                    exit_px = entry_px * (1.0 + tpp)
                    _close_position(exit_px)
                    continue
                if not long_side and lo <= entry_px * (1.0 - tpp):
                    exit_px = entry_px * (1.0 - tpp)
                    _close_position(exit_px)
                    continue

            #
            # (3) インジケーター EXIT （indicator_exit）
            #     例: RSI 閾値など。_indicator_exit_hit が True を返したら次足成行。
            #
            ind_cfg = exit_cfg.get("indicator_exit")
            if ind_cfg is not None and _indicator_exit_hit(pos, i, inds, ind_cfg):
                mkt_px = float(openp.iat[i+1])
                exit_px = mkt_px * (1.0 - slip) if long_side else mkt_px * (1.0 + slip)
                _close_position(exit_px)
                continue

            #
            # (4) 反対シグナル EXIT （opposite_signal_exit）
            #     pos_mask_opposite は run_engine 先頭で計算済みを想定。
            #
            if exit_cfg.get("opposite_signal_exit"):
                if int(pos_mask_opposite.iat[i]) == 1:
                    mkt_px = float(openp.iat[i+1])
                    exit_px = mkt_px * (1.0 - slip) if long_side else mkt_px * (1.0 + slip)
                    _close_position(exit_px)
                    continue

            #
            # (5) ローソク足パターン EXIT （candle_exit）
            #     pattern: "pinbar" / "engulfing" / "inside"
            #     signal : "bullish" / "bearish"
            #
            candle_cfgs = exit_cfg.get("candle_exit") or []
            if candle_cfgs:
                o_cur = float(df["open"].iat[i])
                c_cur = float(df["close"].iat[i])
                h_cur = hi
                l_cur = lo

                body = abs(c_cur - o_cur)
                rng = max(h_cur - l_cur, 1e-9)
                upper_wick = h_cur - max(o_cur, c_cur)
                lower_wick = min(o_cur, c_cur) - l_cur

                for c in candle_cfgs:
                    entry_side = c.get("entrySide")
                    if entry_side and entry_side != pos.get("side"):
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
                        o_prev = float(df["open"].iat[i-1])
                        c_prev = float(df["close"].iat[i-1])
                        if sig == "bullish":
                            # 前足陰線 & 今足陽線で実体が包み込むイメージ
                            matched = (
                                c_prev < o_prev and
                                c_cur > o_cur and
                                c_cur >= o_prev and
                                o_cur <= c_prev
                            )
                        elif sig == "bearish":
                            matched = (
                                c_prev > o_prev and
                                c_cur < o_cur and
                                c_cur <= o_prev and
                                o_cur >= c_prev
                            )

                    elif pat == "inside" and i > 0:
                        h_prev = float(df["high"].iat[i-1])
                        l_prev = float(df["low"].iat[i-1])
                        matched = (h_cur <= h_prev and l_cur >= l_prev)

                    if matched:
                        mkt_px = float(openp.iat[i+1])
                        exit_px = mkt_px * (1.0 - slip) if long_side else mkt_px * (1.0 + slip)
                        _close_position(exit_px)
                        break

                if not in_pos:
                    # どれかの candle_exit でクローズ済み
                    continue

            #
            # (6) 強制 EXIT ウィンドウ（forced_exit）
            #     start / end は ISO 文字列想定。範囲内に入ったら次足成行で閉じる。
            #
            fe = exit_cfg.get("forced_exit")
            if fe:
                now_ts = pd.to_datetime(ts.iat[i])
                fe_start = fe.get("start")
                fe_end = fe.get("end")
                in_window = False

                if fe_start is not None:
                    if now_ts >= pd.to_datetime(fe_start):
                        in_window = True
                if fe_end is not None:
                    if now_ts >= pd.to_datetime(fe_end):
                        in_window = True

                if in_window:
                    mkt_px = float(openp.iat[i+1])
                    exit_px = mkt_px * (1.0 - slip) if long_side else mkt_px * (1.0 + slip)
                    _close_position(exit_px)
                    continue

            #
            # (7) トレーリング pips （trail_pips）
            #     単純に「ある程度伸びたら stop を価格の手前にずらす」実装。
            #
            trail_conf = exit_cfg.get("trail_pips")
            if trail_conf:
                activate_pips = float(trail_conf.get("activate", 0.0))
                trail_pips_val = float(trail_conf.get("trail", 0.0))
                if activate_pips > 0 and trail_pips_val > 0:
                    pip = 0.0001  # かなり雑だが FX 想定の1pips
                    activate_dist = activate_pips * pip
                    trail_dist = trail_pips_val * pip
                    last_close = float(close.iat[i])

                    if long_side:
                        # 利益が activate_dist 以上乗ったらストップを引き上げ
                        if last_close - entry_px >= activate_dist:
                            new_stop = last_close - trail_dist
                            if pos.get("stop") is None or new_stop > pos["stop"]:
                                pos["stop"] = new_stop
                    else:
                        if entry_px - last_close >= activate_dist:
                            new_stop = last_close + trail_dist
                            if pos.get("stop") is None or new_stop < pos["stop"]:
                                pos["stop"] = new_stop

            #
            # (8) time-stop exit （N 本保有 → 次足成行）
            #
            tsbars = exit_cfg.get("time_stop_bars")
            if tsbars is not None:
                tsbars = int(tsbars)
                if (i - entry_idx) >= tsbars:
                    mkt_px = float(openp.iat[i+1])
                    exit_px = mkt_px * (1.0 - slip) if long_side else mkt_px * (1.0 + slip)
                    _close_position(exit_px)
                    continue
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

    # === equity JSON 形式変換 ===
    equity_list = [
        {"t": str(ts.iat[i]), "e": float(equity.iat[i])}
        for i in range(len(equity))
    ]

    return {
        "summary": summary,
        "equity": equity_list,
        "trades": trades,
    }
    
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

            out_long  = run_engine(df, cfg_long)
            out_short = run_engine(df, cfg_short)

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
            out = run_engine(df, engine_cfg)

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
