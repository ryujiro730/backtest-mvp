# worker/engine/loader.py

import json
import os
import pandas as pd
import psycopg

BASE = os.getenv("DATA_DIR", "/delver/data")
POSTGRES_URL = os.getenv("POSTGRES_URL")

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

    df = pd.read_parquet(local_path)

    if df.index.name == 'datetime':
        df = df.reset_index()

    need = ['datetime', 'open', 'high', 'low', 'close']
    df = df[need]

    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
    df[['open', 'high', 'low', 'close']] = df[['open', 'high', 'low', 'close']].apply(pd.to_numeric, errors='coerce')

    df = df.dropna().sort_values('datetime').reset_index(drop=True)
    return df
