import os, json, boto3
from botocore.config import Config
from fastapi import APIRouter, Response

router = APIRouter()

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
    region_name=os.getenv("S3_REGION","us-east-1"),
    config=Config(signature_version="s3v4", s3={"addressing_style":"path"}),
)

BUCKET = os.getenv("S3_BUCKET_DATA", "backtest-data")
PREFIX = os.getenv("S3_PREFIX", "data/")  # 直下なら "data/"

@router.get("/catalog")   # main.py 側で prefix="/api" を付けている前提
def get_catalog():
    pairs, tfs, items = set(), set(), []
    token = None
    while True:
        kw = {"Bucket": BUCKET, "Prefix": PREFIX}
        if token: kw["ContinuationToken"] = token
        r = s3.list_objects_v2(**kw)

+        for o in r.get("Contents", []):
+            key = o["Key"]
+            name = key.split("/")[-1]
+            if not name.endswith(".parquet"):
+                continue  
            base = name[:-8]                      # drop ".parquet"
            parts = base.split("_")
            if len(parts) != 2:
                continue
            pair, tf = parts[0].upper(), parts[1].upper()
            pairs.add(pair); tfs.add(tf)
            items.append({
                "pair": pair,
                "timeframe": tf,
                "dataset_hash": base,             # = "EURUSD_M15"
            })

        if not r.get("IsTruncated"): break
        token = r.get("NextContinuationToken")

    payload = {"pairs": sorted(pairs), "timeframes": sorted(tfs), "items": items}
    return Response(json.dumps(payload), media_type="application/json",
                    headers={"Cache-Control":"no-store"})
