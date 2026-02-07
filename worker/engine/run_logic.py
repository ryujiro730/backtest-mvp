# worker/engine/run_logic.py

import os
import sys
import time
import json
import psycopg
import pandas as pd

from worker.engine.loader import _load_strategy_json, _load_prices
from worker.engine.engine import run_engine
from worker.engine.save import save_result
POSTGRES_URL = os.getenv("POSTGRES_URL")

def normalize_exit(exit_raw, direction=None):
    """
    exit_raw を正規化。direction が "long" / "short" で exit_raw に long/short キーがある場合は
    その側の TP/SL 等をマージ。無い場合は従来どおりトップレベルの値を使用。
    """
    out = {}

    if not exit_raw:
        return out

    # ロング/ショート別があればその側をベースに、なければトップレベルを参照
    side_key = "long" if direction == "long" else "short" if direction == "short" else None
    base = exit_raw.get(side_key) if side_key and isinstance(exit_raw.get(side_key), dict) else exit_raw

    # pips-based
    if base.get("sl_fixed_pips") is not None:
        out["sl_fixed_pips"] = float(base["sl_fixed_pips"])
    if base.get("tp_r_multiple") is not None:
        out["tp_r_multiple"] = float(base["tp_r_multiple"])

    # pct-based
    if base.get("sl_pct") is not None:
        out["sl_pct"] = float(base["sl_pct"]) / 100.0
    if base.get("tp_pct") is not None:
        out["tp_pct"] = float(base["tp_pct"]) / 100.0

    # time exit
    if base.get("time_stop_bars") is not None:
        out["time_stop_bars"] = int(base["time_stop_bars"])
    if base.get("tp_time_stop_bars") is not None:
        out["tp_time_stop_bars"] = int(base["tp_time_stop_bars"])
    if base.get("sl_time_stop_bars") is not None:
        out["sl_time_stop_bars"] = int(base["sl_time_stop_bars"])

    # 共通（forced / candle / trail / indicator）はトップレベルから
    if exit_raw.get("forced_exit") is not None:
        out["forced_exit"] = exit_raw["forced_exit"]
    if exit_raw.get("candle_exit") is not None:
        out["candle_exit"] = exit_raw["candle_exit"]
    if exit_raw.get("trail_pips") is not None:
        out["trail_pips"] = exit_raw["trail_pips"]
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
    entry_blocks_raw = raw.get("entry_blocks")
    if isinstance(entry_blocks_raw, list) and len(entry_blocks_raw) > 0:
        n_blocks = len(entry_blocks_raw)
    else:
        # ファイルに entry_blocks が無い場合（旧保存 or API 経路で欠落）: entry から1ブロックを合成して OR 扱いにする
        entries_list = raw.get("entry") or []
        if isinstance(entries_list, list) and entries_list:
            entry_blocks_raw = [{"logic": "OR", "entries": entries_list}]
            n_blocks = 1
            print(f"[STRAT] entry_blocks が無いため entry から1ブロック(OR)を合成", flush=True)
        else:
            entry_blocks_raw = None
            n_blocks = 0
    print(f"[STRAT] sid={sid} direction={raw.get('direction','long')} "
          f"entry_blocks={n_blocks} (AND/ORはentry_blocksがあるときのみ有効) "
          f"entries={len(raw.get('entry', []))}",
          flush=True)

    if raw.get("pair") == "__FAIL__":
        raise RuntimeError("forced failure for test")

    # --- 2) 基本設定 ---
    direction = str(raw.get("direction", "long")).lower()
    entries = raw.get("entry", [])
    if not isinstance(entries, list) or not entries:
        raise RuntimeError("Strategy payload must have a non-empty 'entry' list")

    exit_cfg = normalize_exit(raw.get("exit"), direction)

    fee_bps = float(raw.get("fee_bps", os.getenv("FEE_BPS_DEFAULT", "5.0")))
    slip_bps = float(raw.get("slippage_bps", os.getenv("SLIPPAGE_BPS_DEFAULT", "0.5")))

    raw_trading = raw.get("trading", {}) or {}

    pair = str(raw.get("pair", "EURUSD"))
    timeframe = str(raw.get("timeframe", "H1"))

    engine_cfg = {
        "direction": direction,
        "fee_bps": fee_bps,
        "slippage_bps": slip_bps,
        "entries": entries,
        "exit": exit_cfg,
        "trading": raw_trading,
        "pair": pair,
        "timeframe": timeframe,
    }
    # entry_blocks があれば必ず渡す（AND/OR はここがないと効かない）
    if entry_blocks_raw and isinstance(entry_blocks_raw, list) and len(entry_blocks_raw) > 0:
        engine_cfg["entry_blocks"] = entry_blocks_raw
        print(f"[STRAT] entry_blocks を適用 blocks={len(entry_blocks_raw)}", flush=True)

    # --- 3) 価格データをロード ---
    t_load = time.perf_counter()
    df = _load_prices(dataset_hash)
    t_load_done = time.perf_counter()

    # --- 4) direction = both の場合は2回実行して合成 ---
    # entry_blocks は side で分割しない。AND は「同ブロック内の全条件が同時成立」なので、
    # RSI long と RSI short を AND にすると同時成立はあり得ずトレード0になる。分割すると
    # 各 run が単一条件になり 325 トレードなどになる不具合を防ぐ。
    if direction == "both":
        long_entries  = [e for e in entries if (e.get("side") in (None, "long"))]
        short_entries = [e for e in entries if (e.get("side") in (None, "short"))]

        cfg_long  = {**engine_cfg, "direction": "long", "entries": long_entries, "exit": normalize_exit(raw.get("exit"), "long")}
        cfg_short = {**engine_cfg, "direction": "short", "entries": short_entries, "exit": normalize_exit(raw.get("exit"), "short")}
        if entry_blocks_raw:
            cfg_long["entry_blocks"] = entry_blocks_raw
            cfg_short["entry_blocks"] = entry_blocks_raw

        out_long  = run_engine(df, cfg_long)
        out_short = run_engine(df, cfg_short)

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
        out = run_engine(df, engine_cfg)

    t_engine_done = time.perf_counter()
    print(
        f"[perf] run_backtest_logic load_prices={t_load_done - t_load:.3f}s run_engine_wall={t_engine_done - t_load_done:.3f}s",
        file=sys.stderr,
        flush=True,
    )

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
