# worker/engine/save.py
import os, json, psycopg

POSTGRES_URL = os.getenv("POSTGRES_URL")


def save_result(run_id, summary, equity, trades):
    """Save results to PostgreSQL (primary) and filesystem (fallback for local dev)."""
    # --- DB save ---
    if POSTGRES_URL:
        try:
            with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE runs
                       SET equity_data = %s,
                           trades_data = %s
                     WHERE run_id = %s
                    """,
                    (json.dumps(equity), json.dumps(trades), run_id),
                )
                conn.commit()
            print(f"[SAVE] saved results to DB for run_id={run_id}", flush=True)
        except Exception as e:
            print(f"[SAVE] DB save failed: {e}", flush=True)

    # --- Filesystem save (local dev / volume mount fallback) ---
    base = f"/delver/results/{run_id}"
    try:
        os.makedirs(base, exist_ok=True)
        with open(f"{base}/summary.json", "w") as f:
            json.dump(summary, f)
        with open(f"{base}/equity.json", "w") as f:
            json.dump(equity, f)
        with open(f"{base}/trades.json", "w") as f:
            json.dump(trades, f)
        print(f"[SAVE] saved results to {base}", flush=True)
    except Exception as e:
        print(f"[SAVE] filesystem save skipped/failed: {e}", flush=True)
