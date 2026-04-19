"""
差分更新: all_1m_clean.parquet に新しいzipを追加マージし、
/data/ の時間足別Parquetを再生成する。
"""

import gc
import zipfile
import pandas as pd
from pathlib import Path

BINANCE_DIR = Path("/home/tj/dev/delver/scripts/binance_data")
OUTPUT_DIR  = Path("/home/tj/dev/delver/data")

BINANCE_COLS = [
    "open_time", "open", "high", "low", "close", "volume",
    "close_time", "quote_volume", "trades",
    "taker_buy_base", "taker_buy_quote", "ignore",
]

RESAMPLE_MAP = {
    "M1":  None,
    "M5":  "5min",
    "M15": "15min",
    "M30": "30min",
    "H1":  "1h",
    "H4":  "4h",
    "D1":  "1D",
    "W1":  "1W",
}

OHLCV_AGG = {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}


def read_zip(path: Path) -> pd.DataFrame:
    with zipfile.ZipFile(path) as z:
        with z.open(z.namelist()[0]) as f:
            df = pd.read_csv(f, header=None, names=BINANCE_COLS)
    # 2025年以降は open_time がマイクロ秒(µs)に変わっている
    # 13桁以下→ms、16桁→µs で自動判定
    sample = df["open_time"].iloc[0]
    unit = "us" if sample > 1e14 else "ms"
    df["datetime"] = pd.to_datetime(df["open_time"], unit=unit)
    df = df.set_index("datetime")[["open", "high", "low", "close", "volume"]]
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


_MAX_TS = pd.Timestamp("2100-01-01")

def clean(df: pd.DataFrame) -> pd.DataFrame:
    # 壊れたタイムスタンプ（NaT・未来）を除去
    df = df[df.index.notna() & (df.index < _MAX_TS)]
    df = df[~df.isnull().any(axis=1)]
    df = df[(df[["open", "high", "low", "close"]] > 0).all(axis=1)]
    bad_h = df["high"] < df[["open", "close"]].max(axis=1)
    bad_l = df["low"]  > df[["open", "close"]].min(axis=1)
    df.loc[bad_h, "high"] = df.loc[bad_h, ["open", "close"]].max(axis=1)
    df.loc[bad_l, "low"]  = df.loc[bad_l,  ["open", "close"]].min(axis=1)
    df.loc[df["volume"] < 0, "volume"] = 0.0
    df = df[~df.index.duplicated(keep="first")]
    return df.sort_index()


def check(df: pd.DataFrame, tag: str, rule: str | None) -> bool:
    ok = True
    if df.isnull().sum().sum():
        print(f"  FAIL {tag}: NaN残存"); ok = False
    bad_h = (df["high"] < df[["open","close"]].max(axis=1)).sum()
    bad_l = (df["low"]  > df[["open","close"]].min(axis=1)).sum()
    if bad_h or bad_l:
        print(f"  FAIL {tag}: OHLC不整合 high={bad_h} low={bad_l}"); ok = False
    if df.index.duplicated().sum():
        print(f"  FAIL {tag}: 重複タイムスタンプ"); ok = False
    if not df.index.is_monotonic_increasing:
        print(f"  FAIL {tag}: ソート崩れ"); ok = False
    if ok:
        print(f"  OK   {tag}: {len(df):,}行  {df.index[0]} → {df.index[-1]}")
    return ok


def main():
    symbols = sorted(d.name for d in BINANCE_DIR.iterdir() if d.is_dir())
    all_ok = True

    for sym in symbols:
        src = BINANCE_DIR / sym / "1m" / "all_1m_clean.parquet"
        if not src.exists():
            print(f"[SKIP] {sym}: all_1m_clean.parquet なし")
            continue

        base_df = pd.read_parquet(src)
        base_df.index.name = "datetime"
        last_ts = base_df.index.max()

        # 追加対象zip: last_tsより後の月のファイル
        all_zips = sorted((BINANCE_DIR / sym / "1m").glob(f"{sym}-1m-*.zip"))
        new_zips = [
            z for z in all_zips
            if z.stem > f"{sym}-1m-{last_ts.year}-{last_ts.month:02d}"
        ]

        if not new_zips:
            print(f"[{sym}] 追加なし（最新: {last_ts.date()}）")
            df_1m = base_df
        else:
            print(f"[{sym}] {len(new_zips)}ヶ月追加 ({new_zips[0].stem[-7:]} → {new_zips[-1].stem[-7:]})")
            new_frames = [clean(read_zip(z)) for z in new_zips]
            new_data   = pd.concat(new_frames)
            new_data   = new_data[new_data.index > last_ts]   # 月境界重複を除去
            df_1m = pd.concat([base_df, new_data]).sort_index()
            df_1m = df_1m[~df_1m.index.duplicated(keep="first")]

            # 中間ファイルも更新
            df_1m.index.name = "open_time"
            df_1m.to_parquet(src)
            df_1m.index.name = "datetime"
            print(f"  all_1m_clean.parquet 更新: {len(df_1m):,}行 → {df_1m.index[-1].date()}")

        # 全時間足を再生成
        print(f"  時間足Parquet生成中...")
        for tf, rule in RESAMPLE_MAP.items():
            if rule is None:
                df_out = df_1m.copy()
            else:
                df_out = (
                    df_1m.resample(rule, label="left", closed="left")
                    .agg(OHLCV_AGG)
                    .dropna(subset=["open", "close"])
                )
            df_out.index.name = "datetime"
            df_out.to_parquet(OUTPUT_DIR / f"{sym}_{tf}.parquet")

        del df_1m; gc.collect()

    print("\n=== 最終整合性チェック ===")
    for sym in symbols:
        for tf, rule in RESAMPLE_MAP.items():
            p = OUTPUT_DIR / f"{sym}_{tf}.parquet"
            if not p.exists():
                print(f"  MISSING {sym}_{tf}"); all_ok = False; continue
            df = pd.read_parquet(p)
            ok = check(df, f"{sym}_{tf}", rule)
            if not ok:
                all_ok = False
            del df; gc.collect()

    print()
    print("=== 全チェック PASSED ===" if all_ok else "=== FAILED あり ===")


if __name__ == "__main__":
    main()
