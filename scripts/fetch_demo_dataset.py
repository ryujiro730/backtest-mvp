# scripts/fetch_demo_dataset.py
import os, io, hashlib, json
from datetime import datetime, timezone
import pandas as pd
import yfinance as yf
import boto3
from botocore.exceptions import ClientError

S3_ENDPOINT = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin123")
BKT_DATA = os.getenv("BKT_DATA", "backtest-data")

def sha16(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()[:16]

def ensure_bucket(s3, bucket: str):
    try:
        s3.head_bucket(Bucket=bucket)
    except ClientError:
        try:
            s3.create_bucket(Bucket=bucket)
        except ClientError as e:
            if e.response["Error"]["Code"] not in ("BucketAlreadyOwnedByYou","BucketAlreadyExists"):
                raise

def normalize(df: pd.DataFrame) -> pd.DataFrame:
    # yfinanceは時々MultiIndex列を返すので平坦化
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]

    # 時間はインデックスに居ることが多いので、必ず列に出す
    if "timestamp" not in df.columns:
        idx_name = df.index.name or "timestamp"
        df = df.reset_index().rename(columns={idx_name: "timestamp"})

    # 列名の揺れを正規化
    df = df.rename(columns={
        "Datetime": "timestamp", "Date": "timestamp",
        "Open": "open", "High": "high", "Low": "low", "Close": "close"
    })

    # 必須列の存在チェック
    need = {"timestamp","open","high","low","close"}
    missing = need - set(df.columns)
    if missing:
        raise ValueError(f"Required columns missing: {missing}. Got columns: {list(df.columns)}")

    # 型と並びを正規化（UTC tz-naive, float64）
    ts = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df = df.loc[ts.notna()].copy()
    df["timestamp"] = ts.loc[ts.notna()].dt.tz_convert(None)
    for c in ["open","high","low","close"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df = df.dropna(subset=["open","high","low","close"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    return df[["timestamp","open","high","low","close"]]

def fetch(pair="EURUSD=X", interval="1h"):
    # intradayは直近730日制限。安全に720日に固定。
    df = yf.download(
        pair,
        period="720d",            # ← ココがポイント
        interval=interval,
        group_by="column",
        auto_adjust=False,
        progress=False,
        threads=False,
    )
    if df is None or df.empty:
        raise ValueError("Downloaded dataframe is empty. Try a different pair or shorter period.")
    return normalize(df.reset_index())

def main():
    df = fetch()
    buf = io.BytesIO()
    df.to_parquet(buf, index=False)  # snappy
    blob = buf.getvalue()
    ds_hash = sha16(blob)

    s3 = boto3.client("s3", endpoint_url=S3_ENDPOINT,
                      aws_access_key_id=S3_ACCESS_KEY, aws_secret_access_key=S3_SECRET_KEY)
    ensure_bucket(s3, BKT_DATA)

    s3.put_object(Bucket=BKT_DATA, Key=f"data/{ds_hash}.parquet",
                  Body=blob, ContentType="application/octet-stream")

    meta = {
        "pair": "EURUSD=X", "interval": "1h",
        "from": "2023-01-01", "to": "2025-01-01",
        "rows": len(df), "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_hash": ds_hash, "format": "parquet"
    }
    s3.put_object(Bucket=BKT_DATA, Key=f"data/index/{ds_hash}.json",
                  Body=json.dumps(meta).encode("utf-8"), ContentType="application/json")

    print(ds_hash)

if __name__ == "__main__":
    main()

