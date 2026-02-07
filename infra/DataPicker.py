import pandas as pd
from pathlib import Path

src = Path("/data/principal")
dst = Path("/data/converted")
dst.mkdir(parents=True, exist_ok=True)

for file in src.rglob("*.csv"):
    parts = file.stem.split("_")
    pair = parts[2] if len(parts) >= 4 else "UNKNOWN"
    tf   = parts[3] if len(parts) >= 4 else "M1"

    df = pd.read_csv(
        file,
        header=None,
        names=["date","time","open","high","low","close","volume"],
        engine="python",
        sep=r"[;,]"
    )

    dtstr = df["date"].astype(str).str.zfill(8) + df["time"].astype(str).str.zfill(6)
    df["timestamp"] = pd.to_datetime(dtstr, format="%Y%m%d%H%M%S", errors="coerce")
    df["timeframe"] = tf
    df = df[["timestamp","open","high","low","close","volume","timeframe"]].dropna(subset=["timestamp"])

    out = dst / f"{pair}_{tf}.parquet"
    df.to_parquet(out, index=False)
    print("saved:", out)
