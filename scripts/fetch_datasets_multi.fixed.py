#!/usr/bin/env python3
"""
fetch_datasets_multi.py

Download multiple FX symbols and timeframes from Yahoo Finance (via yfinance),
respecting Yahoo's intraday lookback limits, then upload parquet + index JSON
to S3/MinIO under:
  s3://<S3_BUCKET_DATA>/data/<hash>.parquet
  s3://<S3_BUCKET_DATA>/data/index/<hash>.json

ENV (or docker-compose env) must define:
  S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, S3_BUCKET_DATA

Usage (in project root; inside API container is easiest):
  python scripts/fetch_datasets_multi.py --pairs EURUSD=X,USDJPY=X,XAUUSD=X       --tf 1h,4h,1d --from 2018-01-01 --to 2025-01-01
"""
import argparse, os, sys, time, json, hashlib, datetime as dt
from typing import List, Tuple
import boto3
from botocore.config import Config
import pandas as pd
import yfinance as yf

S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://localhost:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin123")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
BUCKET = os.getenv("S3_BUCKET_DATA", "backtest-data")

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION,
    config=Config(s3={"addressing_style": "path"}),
)

# Yahoo intraday lookback caps (approx; subject to change)
MAX_DAYS_BY_INTERVAL = {
    "1m": 7,
    "2m": 60, "5m": 60, "15m": 60, "30m": 60,
    "60m": 730, "1h": 730,
    "90m": 730, "2h": 730, "4h": 730,
    # Daily or higher: virtually unlimited for many symbols
    "1d": 36500, "1wk": 36500, "1mo": 36500,
}

# Reasonable window sizes per interval so we don't request too big chunks
WINDOW_DAYS_BY_INTERVAL = {
    "1m": 3,
    "2m": 20, "5m": 20, "15m": 20, "30m": 20,
    "60m": 180, "1h": 180, "2h": 180, "4h": 180,
    "1d": 800, "1wk": 2000, "1mo": 4000,
}

def daterange_chunks(start: dt.date, end: dt.date, step_days: int) -> List[Tuple[dt.date, dt.date]]:
    """Yield non-overlapping [start, end) daily chunks."""
    cur = start
    out = []
    while cur < end:
        nxt = min(cur + dt.timedelta(days=step_days), end)
        out.append((cur, nxt))
        cur = nxt
    return out

def tf_to_yf(tf: str) -> str:
    tf = tf.lower()
    return {"h1":"1h","h4":"4h","d1":"1d"}.get(tf, tf)

def compute_effective_range(tf: str, start: dt.date, end: dt.date) -> Tuple[dt.date, dt.date, str]:
    """Clip requested range to Yahoo's lookback limit if needed."""
    tf = tf_to_yf(tf)
    max_days = MAX_DAYS_BY_INTERVAL.get(tf, 36500)
    earliest = dt.date.today() - dt.timedelta(days=max_days - 1)
    if start < earliest and max_days < 36500:
        print(f"[warn] {tf} limited to last {max_days} days. Clipping start from {start} -> {earliest}", file=sys.stderr)
        start = earliest
    return start, end, tf

def download_one(sym: str, tf: str, start: dt.date, end: dt.date) -> pd.DataFrame:
    start, end, tf = compute_effective_range(tf, start, end)
    window = WINDOW_DAYS_BY_INTERVAL.get(tf, 180)
    chunks = daterange_chunks(start, end, window)
    frames: List[pd.DataFrame] = []
    for (a, b) in chunks:
        for attempt in range(3):
            try:
                df = yf.download(
                    sym, start=a.isoformat(), end=b.isoformat(),
                    interval=tf, auto_adjust=True, progress=False, threads=False,
                )
                # YF sometimes returns empty even for valid periods; skip silently
                if isinstance(df, pd.DataFrame) and not df.empty:
                    df = df.reset_index().rename(columns=str.lower)
                    # yfinance uses "datetime" or "index" depending on interval; normalize
                    if "datetime" in df.columns:
                        df.rename(columns={"datetime": "timestamp"}, inplace=True)
                    elif "date" in df.columns:
                        df.rename(columns={"date": "timestamp"}, inplace=True)
                    df["symbol"] = sym
                    frames.append(df[["timestamp","open","high","low","close","volume","symbol"]])
                break
            except Exception as e:
                if attempt == 2:
                    print(f"[fail] {sym} {tf} {a}..{b}: {e}", file=sys.stderr)
                time.sleep(1.0 * (attempt + 1))
    if not frames:
        return pd.DataFrame(columns=["timestamp","open","high","low","close","volume","symbol"])
    out = pd.concat(frames, ignore_index=True)
    if "timestamp" not in out.columns:
        if out.index.name:  # インデックスに時刻が残っているケース
            out = out.reset_index().rename(columns={out.index.name: "timestamp"})
        elif "index" in out.columns:
            out = out.rename(columns={"index": "timestamp"})
        else:
            # 最後の手段: 日時っぽい列名を拾う
            for c in out.columns:
                lc = str(c).lower()
                if "date" in lc or "time" in lc:
                    out = out.rename(columns={c: "timestamp"})
                    break
    out.sort_values("timestamp", inplace=True)
    out.reset_index(drop=True, inplace=True)
    return out

def save_to_s3(df: pd.DataFrame, sym: str, tf: str) -> str:
    if df.empty:
        raise RuntimeError("empty dataframe, nothing to save")
    # Hash independent of date range: just symbol+interval for catalog; content hash for file key
    content = df.to_parquet(index=False)
    file_hash = hashlib.sha256(content).hexdigest()[:16]
    key_data = f"data/{file_hash}.parquet"
    s3.put_object(Bucket=BUCKET, Key=key_data, Body=content, ContentType="application/octet-stream")

    meta = {
        "pair": sym,             # e.g., EURUSD=X
        "interval": tf,          # e.g., 1h
        "rows": int(df.shape[0]),
        "first_ts": str(df["timestamp"].iloc[0]),
        "last_ts": str(df["timestamp"].iloc[-1]),
        "dataset_hash": file_hash,
        "source": "yfinance",
    }
    key_idx = f"data/index/{file_hash}.json"
    s3.put_object(Bucket=BUCKET, Key=key_idx, Body=json.dumps(meta).encode("utf-8"), ContentType="application/json")
    print(f"uploaded: s3://{BUCKET}/{key_idx}\n  rows={meta['rows']}  hash={file_hash}")
    return file_hash

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pairs", required=True, help="Comma-separated Yahoo symbols (e.g., EURUSD=X,USDJPY=X)")
    ap.add_argument("--tf", required=True, help="Comma-separated intervals (e.g., 1h,4h,1d)")
    ap.add_argument("--from", dest="date_from", required=True, help="YYYY-MM-DD")
    ap.add_argument("--to", dest="date_to", required=True, help="YYYY-MM-DD")
    args = ap.parse_args()

    date_from = dt.date.fromisoformat(args.date_from)
    date_to = dt.date.fromisoformat(args.date_to)
    pairs = [p.strip() for p in args.pairs.split(",") if p.strip()]
    tfs = [tf_to_yf(t.strip()) for t in args.tf.split(",") if t.strip()]

    for sym in pairs:
        for tf in tfs:
            print(f"[info] downloading {sym} {tf} {date_from}..{date_to}")
            df = download_one(sym, tf, date_from, date_to)
            if df.empty:
                print(f"[warn] no data for {sym} {tf} in requested range (after clipping).", file=sys.stderr)
                continue
            save_to_s3(df, sym, tf)

if __name__ == "__main__":
    main()