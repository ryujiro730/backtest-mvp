from pathlib import Path
import re
import pandas as pd

ROOT = Path("/data")
SRC  = ROOT / "converted"     # ← ここに "壊れた" M1 Parquet がある想定
OUT_M1  = ROOT / "M1"
OUT_M15 = ROOT / "M15"
OUT_H1  = ROOT / "H1"
OUT_D1  = ROOT / "D1"
for p in [OUT_M1, OUT_M15, OUT_H1, OUT_D1]:
    p.mkdir(parents=True, exist_ok=True)

def guess_symbol(name: str) -> str:
    m = re.search(r'([A-Z]{6,7})_M1', name) or re.search(r'([A-Z]{6,7})', name)
    return m.group(1) if m else Path(name).stem

def _numify(s: pd.Series) -> pd.Series:
    return pd.to_numeric(s.astype(str).str.replace(",", ".").str.strip(), errors="coerce")

def parse_ts(series: pd.Series) -> pd.Series:
    s = series.astype(str).str.strip()
    ts = pd.to_datetime(s, format="%Y%m%d %H%M%S", errors="coerce")
    mask = ts.isna()
    if mask.any():
        s2 = s[mask].str.replace(r"^(\d{8})(\d{6})$", r"\1 \2", regex=True)
        ts2 = pd.to_datetime(s2, format="%Y%m%d %H%M%S", errors="coerce")
        ts.loc[mask] = ts2
    return ts

def load_and_normalize(fp: Path) -> pd.DataFrame:
    df = pd.read_parquet(fp)

    # case A: 既にtimestamp/open/...がある
    lowers = {c.lower(): c for c in df.columns}
    if {"timestamp","open","high","low","close"}.issubset(lowers):
        out = df.rename(columns={lowers[k]: k for k in ["timestamp","open","high","low","close"] if k in lowers}).copy()
        if "volume" not in out.columns:
            out["volume"] = _numify(df.get("volume", 0))
    else:
        # case B: 1列しかない → "dt;open;high;low;close;volume" 文字列をsplit
        if df.shape[1] == 1:
            s = df.iloc[:, 0].astype(str)
            parts = s.str.split(r"[;,\t]", expand=True)
            if parts.shape[1] < 6:
                raise ValueError(f"{fp.name}: cannot split into 6 fields")
            parts.columns = ["dt","open","high","low","close","volume"]
            out = parts
        # case C: 6列以上 → 位置で [dt, O,H,L,C,V]
        elif df.shape[1] >= 6:
            out = pd.DataFrame({
                "dt":     df.iloc[:, 0],
                "open":   df.iloc[:, 1],
                "high":   df.iloc[:, 2],
                "low":    df.iloc[:, 3],
                "close":  df.iloc[:, 4],
                "volume": df.iloc[:, 5],
            })
        else:
            raise ValueError(f"{fp.name}: unexpected shape {df.shape}")

        out["timestamp"] = parse_ts(out["dt"])
        out.drop(columns=["dt"], inplace=True)
        for c in ["open","high","low","close","volume"]:
            out[c] = _numify(out[c])

    # 整理
    out["timestamp"] = pd.to_datetime(out["timestamp"], errors="coerce")
    out = out.dropna(subset=["timestamp"]).sort_values("timestamp")
    for c in ["open","high","low","close","volume"]:
        out[c] = _numify(out[c])
    if out.empty:
        raise ValueError("empty after normalize")

    # close 全ゼロを暫定救済（検証用）
    if (out["close"] == 0).all() and (out[["open","high","low"]].abs().sum().sum() > 0):
        out["close"] = out[["open","high","low"]].mean(axis=1)

    return out[["timestamp","open","high","low","close","volume"]]

def fill_m1(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates(subset=["timestamp"]).sort_values("timestamp")
    start, end = df["timestamp"].iloc[0], df["timestamp"].iloc[-1]
    full = pd.date_range(start, end, freq="1T")
    # 24/5 想定：土日ざっくり除去
    full = full[(full.weekday < 5)]
    base = df.set_index("timestamp").reindex(full)

    prev_close = base["close"].ffill()
    for c in ["open","high","low","close"]:
        base[c] = base[c].fillna(prev_close)
    base["volume"] = base["volume"].fillna(0)

    out = base.reset_index().rename(columns={"index":"timestamp"})
    for c in ["open","high","low","close","volume"]:
        out[c] = _numify(out[c]).fillna(method="ffill").fillna(0)
    return out

def resample(df: pd.DataFrame, rule: str) -> pd.DataFrame:
    ohlc = {"open":"first","high":"max","low":"min","close":"last","volume":"sum"}
    return (
        df.set_index("timestamp")
          .resample(rule, label="right", closed="right")
          .apply(ohlc)
          .dropna(subset=["open","high","low","close"])
          .reset_index()
    )

def main():
    files = sorted(SRC.glob("*.parquet"))
    if not files:
        print(f"No parquet files in {SRC}")
        return
    for fp in files:
        sym = guess_symbol(fp.name)
        try:
            raw = load_and_normalize(fp)
            m1  = fill_m1(raw)
        except Exception as e:
            print(f"[SKIP] {fp.name}: {e}")
            continue

        (OUT_M1  / f"{sym}_M1.parquet").write_bytes(m1.to_parquet(index=False))
        resample(m1,"15T").to_parquet(OUT_M15/f"{sym}_M15.parquet", index=False)
        resample(m1,"1H").to_parquet(OUT_H1 /f"{sym}_H1.parquet",  index=False)
        resample(m1,"1D").to_parquet(OUT_D1 /f"{sym}_D1.parquet",  index=False)
        print(f"[OK] {sym}: M1={len(m1):,} → M15/H1/D1")
if __name__ == "__main__":
    main()
