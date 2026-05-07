# worker/engine/loader.py

import json
import os
import pandas as pd
import psycopg

BASE = os.getenv("DATA_DIR", "/delver/data/parquet")
POSTGRES_URL = os.getenv("POSTGRES_URL")

_TF_MAX_YEARS = {}  # empty = no cap, load full history
_BARS_PER_YEAR = {"M1": 525_960, "M5": 105_192, "M15": 35_064, "M30": 17_532}


def _ensure_parquet(pair: str, tf: str) -> str:
    """Return local path to parquet file."""
    filename = f"{pair}_{tf}.parquet"
    local_path = os.path.join(BASE, filename)
    if os.path.exists(local_path):
        return local_path
    raise FileNotFoundError(
        f"Parquet file not found: {local_path}\n"
        f"Place {filename} in the data/parquet/ directory."
    )


def _load_strategy_json(sid: str) -> dict:
    """Load strategy JSON from DB (primary) or filesystem (fallback)."""
    if POSTGRES_URL:
        try:
            with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
                cur.execute(
                    "SELECT payload FROM runs WHERE sid=%s AND payload IS NOT NULL ORDER BY created_at DESC LIMIT 1",
                    (sid,),
                )
                row = cur.fetchone()
            if row and row[0]:
                data = row[0]
                if isinstance(data, str):
                    return json.loads(data)
                return data
        except Exception as e:
            print(f"[LOADER] DB strategy lookup failed: {e}", flush=True)

    path = os.path.join(BASE, "strategies", f"{sid}.json")
    with open(path, "r") as f:
        return json.load(f)


def _load_prices(dataset_hash: str):
    """Load OHLC prices from parquet file."""
    if "_" not in dataset_hash:
        raise RuntimeError(f"Invalid dataset_hash format: {dataset_hash}")

    pair, tf = dataset_hash.split("_", 1)
    local_path = _ensure_parquet(pair, tf)

    max_rows = _TF_MAX_YEARS.get(tf, 0) * _BARS_PER_YEAR.get(tf, 0) if tf in _TF_MAX_YEARS else 0

    import pyarrow.parquet as pq
    import pyarrow as pa

    pf = pq.ParquetFile(local_path)
    meta = pf.metadata
    total_rows = meta.num_rows

    if max_rows and total_rows > max_rows:
        skip_rows = total_rows - max_rows
        cumulative = 0
        first_rg = meta.num_row_groups - 1
        for i in range(meta.num_row_groups):
            rg_rows = meta.row_group(i).num_rows
            if cumulative + rg_rows > skip_rows:
                first_rg = i
                break
            cumulative += rg_rows
        tables = [pf.read_row_group(i) for i in range(first_rg, meta.num_row_groups)]
        table = pa.concat_tables(tables)
    else:
        table = pf.read()

    df = table.to_pandas()
    del table

    if df.index.name == "datetime":
        df = df.reset_index()

    need = ["datetime", "open", "high", "low", "close"]
    df = df[[c for c in need if c in df.columns]]

    df["datetime"] = pd.to_datetime(df["datetime"], errors="coerce")
    for col in ["open", "high", "low", "close"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype("float64")

    df = df.dropna().sort_values("datetime").reset_index(drop=True)

    if max_rows and len(df) > max_rows:
        df = df.tail(max_rows).reset_index(drop=True)

    return df
