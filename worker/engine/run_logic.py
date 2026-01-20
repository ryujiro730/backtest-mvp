# worker/engine/run_logic.py

import os
import json
import psycopg
import pandas as pd

from worker.engine.loader import _load_strategy_json, _load_prices
from worker.engine.engine import run_engine
from worker.engine.save import save_result
POSTGRES_URL = os.getenv("POSTGRES_URL")

def normalize_exit(exit_raw):
    out = {}

    if not exit_raw:
        return out

    # pips-based
    if exit_raw.get("sl_fixed_pips") is not None:
        out["sl_fixed_pips"] = float(exit_raw["sl_fixed_pips"])
    if exit_raw.get("tp_r_multiple") is not None:
        out["tp_r_multiple"] = float(exit_raw["tp_r_multiple"])

    # pct-based
    if exit_raw.get("sl_pct") is not None:
        out["sl_pct"] = float(exit_raw["sl_pct"]) / 100.0
    if exit_raw.get("tp_pct") is not None:
        out["tp_pct"] = float(exit_raw["tp_pct"]) / 100.0

    # time exit
    if exit_raw.get("time_stop_bars") is not None:
        out["time_stop_bars"] = int(exit_raw["time_stop_bars"])

    # forced exit
    if exit_raw.get("forced_exit") is not None:
        out["forced_exit"] = exit_raw["forced_exit"]

    # candle exit
    if exit_raw.get("candle_exit") is not None:
        out["candle_exit"] = exit_raw["candle_exit"]

    # trail pips
    if exit_raw.get("trail_pips") is not None:
        out["trail_pips"] = exit_raw["trail_pips"]

    # indicator exit ← ← ← これが抜けていた!!
    if exit_raw.get("indicator_exit") is not None:
        out["indicator_exit"] = exit_raw["indicator_exit"]

    return out



def run_backtest_logic(run_id, sid, seed, code_hash, dataset_hash):
    """
    Celery タスクから呼び出される “実際のバックテスト実行ロジック”.
    tasks.py から独立させることで保守性が上がる。
    """

    # --- 1) ストラテジー JSON を読み込み ---

    raw = _load_strategy_json(sid)

    exit_cfg = raw.get("exit", {}).copy()

    print("[DEBUG EXIT CFG]", exit_cfg, flush=True)

    print(f"[STRAT] sid={sid} entries={json.dumps(raw.get('entry', []))} "
          f"direction={raw.get('direction','long')} "
          f"fee_bps={raw.get('fee_bps')} "
          f"slip_bps={raw.get('slippage_bps')}",
          flush=True)

    if raw.get("pair") == "__FAIL__":
        raise RuntimeError("forced failure for test")

    # --- 2) 基本設定 ---
    direction = str(raw.get("direction", "long")).lower()
    entries = raw.get("entry", [])
    if not isinstance(entries, list) or not entries:
        raise RuntimeError("Strategy payload must have a non-empty 'entry' list")

    exit_cfg = normalize_exit(raw.get("exit"))
    if raw.get("exit", {}).get("max_hold_minutes_profit") is not None:
        exit_cfg["time_stop_minutes"] = raw["exit"]["max_hold_minutes_profit"]

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

    # --- 3) 価格データをロード ---
    pair, signal_tf = dataset_hash.split("_", 1)

    signal_df = _load_prices(f"{pair}_{signal_tf}")
    m1_df     = _load_prices(f"{pair}_M1")

    # --- 4) direction = both の場合は2回実行して合成 ---
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

        # --- summary 再計算 ---
        pnls = [t["pnl"] for t in trades]
        gp = sum(p for p in pnls if p > 0)
        gl = -sum(p for p in pnls if p < 0)
        pf = (gp / gl) if gl > 0 else (float("inf") if gp > 0 else 0.0)
        winrate = (sum(1 for p in pnls if p > 0) / len(pnls)) if pnls else 0.0

        peak = 0.0
        maxdd = 0.0
        for row in merged:
            peak = max(peak, row["e"])
            if peak > 0:
                maxdd = max(maxdd, 1 - (row["e"] / peak))

        summary = {
            "pf": round(pf, 4),
            "winrate": round(winrate, 4),
            "maxdd": round(maxdd, 4),
            "trades": len(trades)
        }

        out = {"summary": summary, "equity": merged, "trades": trades}

    else:
        # --- 通常の long または short のみ ---
        out = run_engine(signal_df, m1_df, engine_cfg)

    # --- 5) DBを更新 ---
    s = out["summary"]
    with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
        cur.execute(
            """
            update runs
               set status='done', finished_at=now(),
                   pf=%s, winrate=%s, maxdd=%s, trades=%s, error=null
             where run_id=%s
            """,
            (s["pf"], s["winrate"], s["maxdd"], s["trades"], run_id),
        )
        conn.commit()

    # --- 6) 結果をローカル保存 ---
    save_result(run_id, s, out["equity"], out.get("trades", []))

    return s
