"""
Convert Binance all_1m_clean.parquet -> FX-format Parquet files in /data/
Format: index=datetime (no tz), columns=[open,high,low,close,volume (float64)]
"""

import os
import gc
import pandas as pd
from pathlib import Path

BINANCE_DIR = Path("/home/tj/dev/delver/scripts/binance_data")
OUTPUT_DIR  = Path("/home/tj/dev/delver/data")

RESAMPLE_MAP = {
    "M1":  None,      # raw
    "M5":  "5min",
    "M15": "15min",
    "M30": "30min",
    "H1":  "1h",
    "H4":  "4h",
    "D1":  "1D",
    "W1":  "1W",
}

OHLCV_AGG = {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}


def check(df: pd.DataFrame, tag: str, rule: str | None) -> bool:
    ok = True
    nulls = df.isnull().sum().sum()
    if nulls:
        print(f"  FAIL {tag}: {nulls} NaN remain"); ok = False
    bad_h = (df["high"] < df[["open","close"]].max(axis=1)).sum()
    bad_l = (df["low"]  > df[["open","close"]].min(axis=1)).sum()
    if bad_h or bad_l:
        print(f"  FAIL {tag}: OHLC bad high={bad_h} low={bad_l}"); ok = False
    dups = df.index.duplicated().sum()
    if dups:
        print(f"  FAIL {tag}: {dups} duplicate timestamps"); ok = False
    if not df.index.is_monotonic_increasing:
        print(f"  FAIL {tag}: not sorted"); ok = False
    if rule:
        try:
            secs = pd.tseries.frequencies.to_offset(rule).nanos / 1e9
            gaps = df.index.to_series().diff().dt.total_seconds().dropna()
            big  = (gaps > secs * 1.5).sum()
            if big:
                print(f"  WARN {tag}: {big} gaps > 1.5x expected interval")
        except ValueError:
            pass  # non-fixed freq (e.g. W1) — skip gap check
    if ok:
        print(f"  OK   {tag}: {len(df):,} rows  {df.index[0]} -> {df.index[-1]}")
    return ok


def main():
    symbols = sorted(d.name for d in BINANCE_DIR.iterdir() if d.is_dir())
    print(f"Symbols: {symbols}\n")

    all_ok = True

    # --- Step 1: per-symbol integrity check of source M1 data ---
    print("=== Step 1: Source M1 integrity ===")
    for sym in symbols:
        src = BINANCE_DIR / sym / "1m" / "all_1m_clean.parquet"
        if not src.exists():
            print(f"  MISSING {sym}")
            continue
        df = pd.read_parquet(src)
        ok = check(df, f"{sym}_M1_src", "1min")
        if not ok:
            all_ok = False
        del df; gc.collect()
    print()

    # --- Step 2: resample and save ---
    print("=== Step 2: Resample & save ===")
    for sym in symbols:
        src = BINANCE_DIR / sym / "1m" / "all_1m_clean.parquet"
        if not src.exists():
            print(f"  SKIP {sym}: no source")
            continue

        df1m = pd.read_parquet(src)
        df1m.index.name = "datetime"   # rename from open_time

        for tf, rule in RESAMPLE_MAP.items():
            if rule is None:
                df_out = df1m.copy()
            else:
                df_out = (
                    df1m.resample(rule, label="left", closed="left")
                    .agg(OHLCV_AGG)
                    .dropna(subset=["open", "close"])
                )

            out = OUTPUT_DIR / f"{sym}_{tf}.parquet"
            df_out.to_parquet(out)
            print(f"  Saved {out.name}  ({len(df_out):,} rows)")

        del df1m; gc.collect()
    print()

    # --- Step 3: final integrity check on written files ---
    print("=== Step 3: Final integrity check ===")
    for sym in symbols:
        for tf, rule in RESAMPLE_MAP.items():
            path = OUTPUT_DIR / f"{sym}_{tf}.parquet"
            if not path.exists():
                print(f"  MISSING {sym}_{tf}"); all_ok = False; continue
            df = pd.read_parquet(path)
            ok = check(df, f"{sym}_{tf}", rule or "1min")
            if not ok:
                all_ok = False
            del df; gc.collect()

    print()
    if all_ok:
        print("=== All checks PASSED ===")
    else:
        print("=== Some checks FAILED - review above ===")


if __name__ == "__main__":
    main()
