from pathlib import Path
import re
import os
import sys
import pandas as pd

# ===== 設定 =====
ROOT = Path(os.environ.get("DATA_ROOT", "/data")).expanduser()
SRC  = ROOT / "principal"     # 元CSV
OUT_M1  = ROOT / "M1"         # 整形済みM1
OUT_M15 = ROOT / "M15"
OUT_H1  = ROOT / "H1"
OUT_D1  = ROOT / "D1"
for p in [OUT_M1, OUT_M15, OUT_H1, OUT_D1]:
    p.mkdir(parents=True, exist_ok=True)

def guess_symbol(name: str) -> str:
    # AUDUSD_M1.csv / DAT_ASCII_AUDUSD_M1_2024.csv / AUDUSD.csv など対応
    m = re.search(r'([A-Z]{6,7})_M1', name) \
        or re.search(r'DAT_ASCII_([A-Z]{6,7})', name) \
        or re.search(r'([A-Z]{6,7})', name)
    return m.group(1) if m else Path(name).stem

def _numify(s: pd.Series) -> pd.Series:
    return pd.to_numeric(s.astype(str).str.replace(",", ".").str.strip(), errors="coerce")

def _parse_timestamp(date_series, time_series=None):
    if time_series is None:
        s = date_series.astype(str).str.strip()
        # まず "YYYYMMDD HHMMSS"
        ts = pd.to_datetime(s, format="%Y%m%d %H%M%S", errors="coerce")
        mask = ts.isna()
        if mask.any():
            # "YYYYMMDDHHMMSS" → 空白を挿入して再パース
            s2 = s[mask].str.replace(r"^(\d{8})(\d{6})$", r"\1 \2", regex=True)
            ts2 = pd.to_datetime(s2, format="%Y%m%d %H%M%S", errors="coerce")
            ts.loc[mask] = ts2
        return ts
    else:
        ds = date_series.astype(str).str.strip()
        ts = time_series.astype(str).str.strip()
        return pd.to_datetime(ds + " " + ts, format="%Y%m%d %H%M%S", errors="coerce")

def read_hist_csv(fp: Path) -> pd.DataFrame:
    """
    HistData系 CSV（; 区切り・ヘッダ無し）を読み、timestamp/open/high/low/close/volume に正規化。
    対応パターン：
      - 6列: [dt, open, high, low, close, volume]
      - 7列: [date, time, open, high, low, close, volume]
    """
    # まず“素”で読む
    df = pd.read_csv(fp, sep=";", header=None, engine="python", dtype=str)
    if df.shape[1] == 0:
        raise ValueError("empty CSV")

    if df.shape[1] == 6:
        # dt, O, H, L, C, V
        dt = df.iloc[:, 0]
        open_, high_, low_, close_, vol_ = [df.iloc[:, i] for i in range(1, 6)]
        ts = _parse_timestamp(dt)
    elif df.shape[1] >= 7:
        # date, time, O, H, L, C, V （7列以上あっても先頭7列を使う）
        date_, time_ = df.iloc[:, 0], df.iloc[:, 1]
        open_, high_, low_, close_, vol_ = [df.iloc[:, i] for i in range(2, 7)]
        ts = _parse_timestamp(date_, time_)
    else:
        raise ValueError(f"unexpected column count: {df.shape[1]}")

    out = pd.DataFrame({
        "timestamp": ts,
        "open":  _numify(open_),
        "high":  _numify(high_),
        "low":   _numify(low_),
        "close": _numify(close_),
        "volume": _numify(vol_)
    })
    # 掃除
    out = out.dropna(subset=["timestamp"]).sort_values("timestamp")
    for c in ["open","high","low","close","volume"]:
        out[c] = pd.to_numeric(out[c], errors="coerce")
    # 完全に空はスキップ
    if out.empty:
        raise ValueError("no valid rows after parse")
    return out

def fill_missing_m1(df: pd.DataFrame) -> pd.DataFrame:
    """1分の欠損を前足 close で補完、volume=0。重複除去も実施。"""
    df = df.drop_duplicates(subset=["timestamp"]).sort_values("timestamp")
    start, end = df["timestamp"].iloc[0], df["timestamp"].iloc[-1]
    full = pd.date_range(start, end, freq="1T")
    # FXは24/5想定：ざっくり週末除外（必要なら市場カレンダーに置換）
    full = full[(full.weekday < 5)]
    base = df.set_index("timestamp").reindex(full)

    prev_close = base["close"].ffill()
    for c in ["open","high","low","close"]:
        base[c] = base[c].fillna(prev_close)
    base["volume"] = base["volume"].fillna(0)

    out = base.reset_index().rename(columns={"index": "timestamp"})
    for c in ["open","high","low","close","volume"]:
        out[c] = pd.to_numeric(out[c], errors="coerce").fillna(method="ffill").fillna(0)
    return out

def resample(df: pd.DataFrame, rule: str) -> pd.DataFrame:
    ohlc = {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}
    return (df.set_index("timestamp")
              .resample(rule, label="right", closed="right")
              .apply(ohlc)
              .dropna(subset=["open","high","low","close"])
              .reset_index())

def main():
    csvs = sorted(SRC.rglob("*.csv"))
    if not csvs:
        print(f"[INFO] No CSVs in {SRC}")
        sys.exit(0)

    summary = []
    for fp in csvs:
        sym = guess_symbol(fp.name)
        try:
            raw = read_hist_csv(fp)
            # 全close=0の異常を救済（検証・一時措置）
            if (raw["close"] == 0).all() and (raw[["open","high","low"]].abs().sum().sum() > 0):
                raw["close"] = raw[["open","high","low"]].mean(axis=1)

            m1 = fill_missing_m1(raw)

            # 保存
            p_m1  = OUT_M1  / f"{sym}_M1.parquet"
            p_m15 = OUT_M15 / f"{sym}_M15.parquet"
            p_h1  = OUT_H1  / f"{sym}_H1.parquet"
            p_d1  = OUT_D1  / f"{sym}_D1.parquet"

            m1.to_parquet(p_m1, index=False)
            resample(m1, "15T").to_parquet(p_m15, index=False)
            resample(m1, "1H").to_parquet(p_h1,  index=False)
            resample(m1, "1D").to_parquet(p_d1,  index=False)

            summary.append((sym, len(m1)))
            print(f"[OK] {sym}: M1={len(m1):,} → M15/H1/D1")
        except Exception as e:
            print(f"[SKIP] {fp.name}: {e}")

    if not summary:
        print("[WARN] No outputs created.")
        return

    # ===== 最後に内容チェック（各シンボルの先頭2行を表示） =====
    print("\n=== Quick sanity check ===")
    for sym, _ in summary[:5]:  # 多すぎると煩いので先頭5銘柄
        try:
            m1_path = OUT_M1 / f"{sym}_M1.parquet"
            h1_path = OUT_H1 / f"{sym}_H1.parquet"
            d1_path = OUT_D1 / f"{sym}_D1.parquet"
            dm1 = pd.read_parquet(m1_path).head(2)
            dh1 = pd.read_parquet(h1_path).head(2)
            dd1 = pd.read_parquet(d1_path).head(2)
            print(f"\n{sym}  M1 sample:\n{dm1.to_string(index=False)}")
            print(f"{sym}  H1 sample:\n{dh1.to_string(index=False)}")
            print(f"{sym}  D1 sample:\n{dd1.to_string(index=False)}")
        except Exception as e:
            print(f"[CHECK FAIL] {sym}: {e}")

if __name__ == "__main__":
    main()

