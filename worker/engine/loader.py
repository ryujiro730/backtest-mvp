# worker/engine/loader.py

import json
import pandas as pd
import os

BASE = "/delver/data"

def _load_strategy_json(sid: str) -> dict:
    path = f"{BASE}/strategies/{sid}.json"
    with open(path, "r") as f:
        return json.load(f)

def _load_prices(dataset_hash: str):
    # dataset_hash = "EURUSD_H1" の想定
    if "_" not in dataset_hash:
        raise RuntimeError(f"Invalid dataset_hash format: {dataset_hash}")

    pair, tf = dataset_hash.split("_", 1)

    filename = f"{pair}_{tf}.parquet"
    path = f"data/{filename}"

    if not os.path.exists(path):
        raise FileNotFoundError(f"{path} not found")

    df = pd.read_parquet(path)

    if df.index.name == 'datetime':
        df = df.reset_index()

    need = ['datetime', 'open', 'high', 'low', 'close']
    df = df[need]

    df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
    df[['open','high','low','close']] = df[['open','high','low','close']].apply(pd.to_numeric, errors='coerce')

    df = df.dropna().sort_values('datetime').reset_index(drop=True)
    return df
