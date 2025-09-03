# infra/DataPicker.py
import os
import re
from pathlib import Path
import pandas as pd

# ========= 入出力 =========
IN_ROOT = Path(os.getenv("DOCS_DIR", str(Path.home() / "Downloads"))).expanduser()
OUT_ROOT = Path(os.getenv("OUT_DIR", str(Path.home() / "Documents/backtest-mvp/data"))).expanduser()
OUT_M15, OUT_H1, OUT_D1 = OUT_ROOT/"M15", OUT_ROOT/"H1", OUT_ROOT/"D1"
for d in (OUT_M15, OUT_H1, OUT_D1):
    d.mkdir(parents=True, exist_ok=True)

# ========= CSV探索（HISTDATA を含むものだけ） =========
csv_files = [p for p in IN_ROOT.rglob("*.csv") if "histdata" in str(p).lower()]
print(f"検出CSV: {len(csv_files)} ファイル")
if not csv_files:
    print("HISTDATA を含む CSV が見つかりません。ZIP解凍/置き場所を確認してください。")
    raise SystemExit(1)

# ========= ペア名推定 =========
PAIR_RE = re.compile(r"([A-Z]{6})")
def infer_pair(path: Path) -> str:
    m = PAIR_RE.search(path.name) or PAIR_RE.search(path.parent.name)
    return m.group(1) if m else "UNKNOWN"

# ========= HistData (ASCII, M1) 読み込み =========
def read_one_csv(path: Path) -> pd.DataFrame:
    # 1) とりあえずセミコロンで読む（自動でもOKだが速度重視）
    df = pd.read_csv(path, sep=";", header=None)

    # 2) 先頭6(〜7)列だけ使う（HistData Generic ASCII 前提）
    has_vol = df.shape[1] >= 7
    df = df.iloc[:, : (7 if has_vol else 6)]
    df.columns = ["date", "time", "open", "high", "low", "close"] + (["volume"] if has_vol else [])

    # 3) 先頭3列をまとめた文字列から 8桁の日付 と 6桁の時刻 を「行ごと」に抽出
    first_tokens = df.iloc[:, :3].astype(str).agg(" ".join, axis=1)
    date_s = first_tokens.str.extract(r"(\d{8})", expand=False)
    time_s = first_tokens.str.extract(r"(?<!\d)(\d{6})(?!\d)", expand=False)

    ts = pd.to_datetime(date_s + time_s, format="%Y%m%d%H%M%S", errors="coerce", utc=True)

    bad = ts.isna()
    if bad.any():
        # まだ NaT が出る行は元のトークンを出して何が混ざっているかを確認
        print(f"[DEBUG] {path.name} still NaT sample:\n{first_tokens[bad].head()}")

    # 4) 価格列はポジションでそのまま取り出し（ズレていても先頭から2..5列がOHLC）
    out = pd.DataFrame({
        "timestamp": ts,
        "open":  pd.to_numeric(df["open"],  errors="coerce"),
        "high":  pd.to_numeric(df["high"],  errors="coerce"),
        "low":   pd.to_numeric(df["low"],   errors="coerce"),
        "close": pd.to_numeric(df["close"], errors="coerce"),
    })
    if has_vol:
        out["volume"] = pd.to_numeric(df["volume"], errors="coerce").fillna(0)

    # 5) クリーニング
    keep = ["timestamp", "open", "high", "low", "close"] + (["volume"] if has_vol else [])
    out = (
        out.dropna(subset=["timestamp", "open", "high", "low", "close"])
           .sort_values("timestamp")
           .drop_duplicates(subset=["timestamp"])
           [keep]
    )
    return out


def resample_ohlcv(df: pd.DataFrame, rule: str, tf_label: str) -> pd.DataFrame:
    d = df.set_index("timestamp").copy()
    if "volume" not in d.columns: d["volume"] = 0.0
    o = d["open"].resample(rule).first()
    h = d["high"].resample(rule).max()
    l = d["low"].resample(rule).min()
    c = d["close"].resample(rule).last()
    v = d["volume"].resample(rule).sum()
    out = pd.concat([o,h,l,c,v], axis=1)
    out.columns = ["open","high","low","close","volume"]
    out = out.dropna(subset=["open","high","low","close"]).reset_index()
    out["timeframe"] = tf_label
    return out


# ========= メイン =========
by_pair: dict[str, list[pd.DataFrame]] = {}
debug_once = True

for f in csv_files:
    pair = infer_pair(f)
    try:
        df_raw_head = None
        if debug_once:
            # デバッグ用に頭3行だけ文字として覗く
            df_raw_head = pd.read_csv(f, sep=";", header=None, nrows=3, dtype=str, engine="c")
        df = read_one_csv(f)

        if debug_once:
            print(f"--- DEBUG {f.name} ---")
            print(df_raw_head)
            # NaT/NaN の内訳
            # （read_one_csv の中で dropna しているので、ここでは再度検査）
            # 参考として、再読み込みしてからの NaT/NaN 率を表示
            df_check = pd.read_csv(f, sep=";", header=None, names=["date","time","open","high","low","close","_rest"], dtype=str, nrows=10, engine="c")
            d = df_check["date"].str.replace(r"\D", "", regex=True)
            t = df_check["time"].str.replace(r"\D", "", regex=True).str.zfill(6)
            ts = pd.to_datetime(d + t, format="%Y%m%d%H%M%S", errors="coerce", utc=True)
            print("head timestamps parsed:", ts.tolist())
            print("-----------------------")
            debug_once = False

        if df.empty:
            print(f"[WARN] 空データ: {f.name}")
            continue

        by_pair.setdefault(pair, []).append(df)
        print(f"[OK]  読込: {f.name:35s} rows={len(df):7d} pair={pair}")
    except Exception as e:
        print(f"[WARN] 読み込み失敗: {f.name} :: {e}")

if not by_pair:
    print("有効なCSVが読み込めませんでした。")
    raise SystemExit(1)

print("ペア数:", len(by_pair))
for pair, dfs in by_pair.items():
    m1 = pd.concat(dfs, ignore_index=True).sort_values("timestamp").drop_duplicates(subset=["timestamp"])
    if m1.empty:
        print(f"[WARN] 1分足結合後に空: {pair}")
        continue

    m15 = resample_ohlcv(m1, "15T", "M15")
    h1  = resample_ohlcv(m1, "1H",  "H1")
    d1  = resample_ohlcv(m1, "1D",  "D1")

    OUT_M15.mkdir(parents=True, exist_ok=True)
    OUT_H1.mkdir(parents=True, exist_ok=True)
    OUT_D1.mkdir(parents=True, exist_ok=True)

    m15.to_parquet(OUT_M15 / f"{pair}_M15.parquet", index=False)
    h1.to_parquet (OUT_H1  / f"{pair}_H1.parquet",  index=False)
    d1.to_parquet (OUT_D1  / f"{pair}_D1.parquet",  index=False)
    print(f"[SAVE] {pair}: M15={len(m15)} H1={len(h1)} D1={len(d1)} -> {OUT_ROOT}")
