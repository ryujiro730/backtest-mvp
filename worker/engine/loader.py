# worker/engine/loader.py

import json
import os
import pandas as pd
import psycopg

BASE = os.getenv("DATA_DIR", "/delver/data")
POSTGRES_URL = os.getenv("POSTGRES_URL")

# Cap rows for short timeframes to avoid OOM on Railway (512MB limit).
# Approximate bars per year: M1=525960, M5=105192, M15=35064, M30=17532
_TF_MAX_YEARS = {"M1": 3, "M5": 5, "M15": 10, "M30": 15}
_BARS_PER_YEAR = {"M1": 525_960, "M5": 105_192, "M15": 35_064, "M30": 17_532}

# S3/R2 settings (optional — only needed on Railway where parquet isn't on disk)
S3_BUCKET = os.getenv("PARQUET_BUCKET")       # e.g. "delver-data"
S3_PREFIX = os.getenv("PARQUET_PREFIX", "")   # e.g. "parquet/" or ""
AWS_ENDPOINT = os.getenv("AWS_ENDPOINT_URL")   # e.g. Cloudflare R2 endpoint


def _ensure_parquet(pair: str, tf: str) -> str:
    """Return local path to parquet file, downloading from S3/R2 if needed."""
    filename = f"{pair}_{tf}.parquet"
    local_path = f"{BASE}/{filename}"
    if os.path.exists(local_path):
        return local_path

    # Try relative path (legacy local dev)
    rel_path = f"data/{filename}"
    if os.path.exists(rel_path):
        return rel_path

    # Download from S3/R2
    if not S3_BUCKET:
        raise FileNotFoundError(
            f"Parquet file not found at {local_path} and PARQUET_BUCKET is not set"
        )

    import boto3
    from botocore.config import Config

    kwargs: dict = {}
    if AWS_ENDPOINT:
        kwargs["endpoint_url"] = AWS_ENDPOINT

    s3 = boto3.client("s3", config=Config(signature_version="s3v4"), **kwargs)
    s3_key = f"{S3_PREFIX}{filename}"
    print(f"[LOADER] downloading s3://{S3_BUCKET}/{s3_key} → {local_path}", flush=True)
    os.makedirs(BASE, exist_ok=True)
    s3.download_file(S3_BUCKET, s3_key, local_path)
    print(f"[LOADER] download complete: {local_path}", flush=True)
    return local_path


def _load_strategy_json(sid: str) -> dict:
    """Load strategy JSON from DB (primary) or filesystem (fallback)."""
    # DB lookup
    if POSTGRES_URL:
        try:
            with psycopg.connect(POSTGRES_URL) as conn, conn.cursor() as cur:
                cur.execute("SELECT payload FROM runs WHERE sid=%s AND payload IS NOT NULL ORDER BY created_at DESC LIMIT 1", (sid,))
                row = cur.fetchone()
            if row and row[0]:
                data = row[0]
                if isinstance(data, str):
                    return json.loads(data)
                return data
        except Exception as e:
            print(f"[LOADER] DB strategy lookup failed: {e}", flush=True)

    # Filesystem fallback
    path = f"{BASE}/strategies/{sid}.json"
    with open(path, "r") as f:
        return json.load(f)


def _load_prices(dataset_hash: str):
    """Load OHLC prices from parquet file."""
    if "_" not in dataset_hash:
        raise RuntimeError(f"Invalid dataset_hash format: {dataset_hash}")

    pair, tf = dataset_hash.split("_", 1)
    local_path = _ensure_parquet(pair, tf)

    # Load using pyarrow row-group iteration to avoid reading the full file
    # when only the recent history is needed (avoids OOM on Railway 512MB).
    max_rows = _TF_MAX_YEARS.get(tf, 0) * _BARS_PER_YEAR.get(tf, 0) if tf in _TF_MAX_YEARS else 0

    import pyarrow.parquet as pq
    import pyarrow as pa

    pf = pq.ParquetFile(local_path)
    meta = pf.metadata
    total_rows = meta.num_rows

    if max_rows and total_rows > max_rows:
        # Find first row group that contains data within the last max_rows
        skip_rows = total_rows - max_rows
        cumulative = 0
        first_rg = meta.num_row_groups - 1
        for i in range(meta.num_row_groups):
            rg_rows = meta.row_group(i).num_rows
            if cumulative + rg_rows > skip_rows:
                first_rg = i
                break
            cumulative += rg_rows
        print(f"[LOADER] {tf}: capping to last {_TF_MAX_YEARS[tf]}y — row groups {first_rg}-{meta.num_row_groups-1} of {meta.num_row_groups} (was {total_rows:,} rows)", flush=True)
        tables = [pf.read_row_group(i) for i in range(first_rg, meta.num_row_groups)]
        table = pa.concat_tables(tables)
    else:
        table = pf.read()

    df = table.to_pandas()
    del table  # release pyarrow memory immediately

    if df.index.name == 'datetime':
        df = df.reset_index()

    need = ['datetime', 'open', 'high', 'low', 'close']
    df = df[[c for c in need if c in df.columns]]

    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
    # Use float32 for OHLC to halve memory (~266MB→133MB for M1 full load).
    # engine.py explicitly casts to float64 before Rust calls, so precision is preserved there.
    for col in ['open', 'high', 'low', 'close']:
        df[col] = pd.to_numeric(df[col], errors='coerce').astype('float32')

    df = df.dropna().sort_values('datetime').reset_index(drop=True)

    # Final row cap (handles partial row groups at the boundary)
    if max_rows and len(df) > max_rows:
        df = df.tail(max_rows).reset_index(drop=True)

    return df
