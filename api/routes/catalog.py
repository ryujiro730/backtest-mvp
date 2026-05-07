import os
import json
from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter()

BASE = os.getenv("DATA_DIR", "/delver/data/parquet")


def _build_catalog():
    pairs, tfs, items = set(), set(), []
    if not os.path.isdir(BASE):
        return {"pairs": [], "timeframes": [], "items": []}
    for name in os.listdir(BASE):
        if not name.endswith(".parquet"):
            continue
        base = name[:-8]
        if "_" not in base:
            continue
        parts = base.split("_", 1)
        if len(parts) != 2:
            continue
        pair, tf = parts[0].upper(), parts[1].upper()
        pairs.add(pair)
        tfs.add(tf)
        items.append({"pair": pair, "timeframe": tf, "dataset_hash": base})
    return {"pairs": sorted(pairs), "timeframes": sorted(tfs), "items": items}


@router.get("/catalog")
def get_catalog():
    payload = _build_catalog()
    return Response(
        json.dumps(payload),
        media_type="application/json",
        headers={"Cache-Control": "no-store"},
    )
