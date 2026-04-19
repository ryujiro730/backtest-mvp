"""
Binance CSV (zip) -> Parquet converter
Matches /data/ FX format: datetime index (UTC), columns=[open,high,low,close,volume]
"""

import os
import zipfile
import io
import pandas as pd
import numpy as np
from pathlib import Path
from collections import defaultdict

BINANCE_DIR = Path("/home/tj/dev/delver/scripts/binance_data")
OUTPUT_DIR = Path("/home/tj/dev/delver/data")

BINANCE_COLS = [
    "open_time", "open", "high", "low", "close", "volume",
    "close_time", "quote_volume", "trades",
    "taker_buy_base", "taker_buy_quote", "ignore",
]

RESAMPLE_MAP = {
    "M1":  "1min",
    "M5":  "5min",
    "M15": "15min",
    "M30": "30min",
    "H1":  "1h",
    "H4":  "4h",
    "D1":  "1D",
    "W1":  "1W",
}

OHLCV_AGG = {
    "open":  "first",
    "high":  "max",
    "low":   "min",
    "close": "last",
    "volume": "sum",
}


def read_zip_csv(zip_path: Path) -> pd.DataFrame:
    with zipfile.ZipFile(zip_path) as z:
        name = z.namelist()[0]
        with z.open(name) as f:
            df = pd.read_csv(f, header=None, names=BINANCE_COLS)
    return df


def clean_df(df: pd.DataFrame, symbol: str, source_tf: str) -> pd.DataFrame:
    issues = []

    # Timestamp -> datetime UTC
    df["datetime"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    df = df.set_index("datetime")[["open", "high", "low", "close", "volume"]]

    # Cast to float
    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # 1) Nulls
    null_mask = df.isnull().any(axis=1)
    if null_mask.sum():
        issues.append(f"  Dropped {null_mask.sum()} rows with NaN values")
        df = df[~null_mask]

    # 2) Non-positive prices
    price_mask = (df[["open", "high", "low", "close"]] <= 0).any(axis=1)
    if price_mask.sum():
        issues.append(f"  Dropped {price_mask.sum()} rows with non-positive price")
        df = df[~price_mask]

    # 3) OHLC consistency: high >= max(open,close) and low <= min(open,close)
    bad_high = df["high"] < df[["open", "close"]].max(axis=1)
    bad_low  = df["low"]  > df[["open", "close"]].min(axis=1)
    bad_ohlc = bad_high | bad_low
    if bad_ohlc.sum():
        issues.append(f"  Fixed {bad_ohlc.sum()} rows with inconsistent OHLC (clamp high/low)")
        df.loc[bad_high, "high"] = df.loc[bad_high, ["open", "close"]].max(axis=1)
        df.loc[bad_low,  "low"]  = df.loc[bad_low,  ["open", "close"]].min(axis=1)

    # 4) Negative volume
    neg_vol = df["volume"] < 0
    if neg_vol.sum():
        issues.append(f"  Fixed {neg_vol.sum()} rows with negative volume -> 0")
        df.loc[neg_vol, "volume"] = 0.0

    # 5) Duplicate timestamps
    dups = df.index.duplicated(keep="first")
    if dups.sum():
        issues.append(f"  Dropped {dups.sum()} duplicate timestamps")
        df = df[~dups]

    # 6) Sorted
    if not df.index.is_monotonic_increasing:
        issues.append("  Sorted by timestamp")
        df = df.sort_index()

    if issues:
        print(f"  [{symbol}/{source_tf}] Cleaned:")
        for msg in issues:
            print(msg)

    return df


def resample_ohlcv(df: pd.DataFrame, rule: str) -> pd.DataFrame:
    resampled = df.resample(rule, label="left", closed="left").agg(OHLCV_AGG)
    resampled = resampled.dropna(subset=["open", "close"])
    return resampled


def load_symbol_tf(symbol: str, tf_dir: Path, tf_label: str) -> pd.DataFrame:
    """Load and merge all monthly zip files for one symbol/timeframe."""
    zips = sorted(tf_dir.glob(f"{symbol}-{tf_label}-*.zip"))
    if not zips:
        return pd.DataFrame()

    frames = []
    for z in zips:
        raw = read_zip_csv(z)
        cleaned = clean_df(raw, symbol, tf_label)
        frames.append(cleaned)

    df = pd.concat(frames)

    # Dedup after concat (month boundary overlap)
    dups = df.index.duplicated(keep="first")
    if dups.sum():
        print(f"  [{symbol}/{tf_label}] Dropped {dups.sum()} cross-month duplicate timestamps")
        df = df[~dups]

    df = df.sort_index()
    return df


def check_integrity(df: pd.DataFrame, symbol: str, tf_label: str, rule: str) -> bool:
    ok = True

    if df.empty:
        print(f"  FAIL [{symbol}_{tf_label}]: DataFrame is empty")
        return False

    # Null check
    nulls = df.isnull().sum().sum()
    if nulls:
        print(f"  FAIL [{symbol}_{tf_label}]: {nulls} NaN values remain")
        ok = False

    # OHLC consistency
    bad_high = (df["high"] < df[["open", "close"]].max(axis=1)).sum()
    bad_low  = (df["low"]  > df[["open", "close"]].min(axis=1)).sum()
    if bad_high or bad_low:
        print(f"  FAIL [{symbol}_{tf_label}]: OHLC inconsistency high={bad_high} low={bad_low}")
        ok = False

    # Duplicates
    dups = df.index.duplicated().sum()
    if dups:
        print(f"  FAIL [{symbol}_{tf_label}]: {dups} duplicate timestamps")
        ok = False

    # Sorted
    if not df.index.is_monotonic_increasing:
        print(f"  FAIL [{symbol}_{tf_label}]: not sorted")
        ok = False

    # Gap check: expected freq
    if len(df) > 1:
        freq = pd.tseries.frequencies.to_offset(rule)
        expected_delta = freq.nanos / 1e9
        actual_deltas = df.index.to_series().diff().dt.total_seconds().dropna()
        gaps = actual_deltas[actual_deltas > expected_delta * 1.5]
        if len(gaps) > 0:
            print(f"  WARN [{symbol}_{tf_label}]: {len(gaps)} gaps (largest: {gaps.max()/3600:.1f}h)")

    if ok:
        print(f"  OK   [{symbol}_{tf_label}]: {len(df):,} rows, {df.index[0]} -> {df.index[-1]}")

    return ok


def main():
    symbols = sorted([d.name for d in BINANCE_DIR.iterdir() if d.is_dir()])
    print(f"Symbols: {symbols}\n")

    all_ok = True

    for symbol in symbols:
        sym_dir = BINANCE_DIR / symbol
        print(f"=== {symbol} ===")

        # Determine available raw timeframes
        raw_tfs = {d.name for d in sym_dir.iterdir() if d.is_dir()}
        print(f"  Raw timeframes: {raw_tfs}")

        # Load 1m base data
        df_1m = None
        if "1m" in raw_tfs:
            print("  Loading 1m data...")
            df_1m = load_symbol_tf(symbol, sym_dir / "1m", "1m")
            print(f"  1m loaded: {len(df_1m):,} rows")

        # Load 1h data (only BTCUSDT has native 1h)
        df_1h_native = None
        if "1h" in raw_tfs:
            print("  Loading 1h data (native)...")
            df_1h_native = load_symbol_tf(symbol, sym_dir / "1h", "1h")
            print(f"  1h native loaded: {len(df_1h_native):,} rows")

        if df_1m is None or df_1m.empty:
            print(f"  WARN: No 1m data for {symbol}, skipping\n")
            continue

        # Generate and save each timeframe
        for out_tf, rule in RESAMPLE_MAP.items():
            if out_tf == "M1":
                df_out = df_1m.copy()
            elif out_tf == "H1" and df_1h_native is not None:
                # Use native 1h data for BTC if available
                df_out = df_1h_native.copy()
            else:
                df_out = resample_ohlcv(df_1m, rule)

            out_path = OUTPUT_DIR / f"{symbol}_{out_tf}.parquet"
            df_out.index.name = "datetime"

            # Strip tz for consistency with FX files (FX has no tz)
            if df_out.index.tz is not None:
                df_out.index = df_out.index.tz_localize(None)

            df_out.to_parquet(out_path)

            ok = check_integrity(df_out, symbol, out_tf, rule)
            if not ok:
                all_ok = False

        print()

    print("=== Final integrity check ===")
    crypto_files = sorted(OUTPUT_DIR.glob("*USDT_*.parquet"))
    for f in crypto_files:
        df = pd.read_parquet(f)
        sym_tf = f.stem
        parts = sym_tf.rsplit("_", 1)
        rule = RESAMPLE_MAP.get(parts[1], "1min")
        ok = check_integrity(df, parts[0], parts[1], rule)
        if not ok:
            all_ok = False

    print()
    if all_ok:
        print("All checks PASSED.")
    else:
        print("Some checks FAILED. Review above.")


if __name__ == "__main__":
    main()
