import os, json

def save_result(run_id, summary, equity, trades):
    base = f"/delver/results/{run_id}"
    os.makedirs(base, exist_ok=True)

    with open(f"{base}/summary.json", "w") as f:
        json.dump(summary, f)

    with open(f"{base}/equity.json", "w") as f:
        json.dump(equity, f)

    with open(f"{base}/trades.json", "w") as f:
        json.dump(trades, f)

    print(f"[SAVE] saved results to {base}", flush=True)
