import os, io, struct, lzma, hashlib, json, math
from datetime import datetime, timedelta, timezone
import pandas as pd
import requests
from tqdm import trange

# ---- 設定 ----
OUT_DIR = "data_parquet"
os.makedirs(OUT_DIR, exist_ok=True)

PAIR_MAP = {
    "EURUSD": "EURUSD=X",
    "GBPUSD": "GBPUSD=X",
    "USDJPY": "USDJPY=X",
}

# Dukascopyのシンボルは "/" なし・ "=X" なし（例: EURUSD, GBPUSD, USDJPY）
# URL 例: https://datafeed.dukascopy.com/datafeed/EURUSD/2024/01/01/00h_ticks.bi5
# ティックは 1秒ごとに 20バイトの圧縮データで返ってくる
def bi5_url(symbol: str, dt: datetime) -> str:
    return (
        f"https://datafeed.dukascopy.com/datafeed/"
        f"{symbol}/{dt.strftime('%Y')}/{dt.strftime('%m')}/{dt.strftime('%d')}/"
        f"{dt.strftime('%H')}h_ticks.bi5"
    )

def fetch_hour_ticks(symbol: str, dt: datetime) -> pd.DataFrame:
    """指定1時間分のティックを取得してDataFrameに展開（UTC）。"""
    url = bi5_url(symbol, dt)
    r = requests.get(url, timeout=30)
    if r.status_code != 200 or not r.content:
        return pd.DataFrame(columns=["timestamp", "ask", "bid", "ask_vol", "bid_vol"])

    raw = lzma.decompress(r.content)
    # bi5 の1レコードは 20バイト（5 * 4byte）
    # [ms(相対), ask(px*1e-5), bid(px*1e-5), ask_vol, bid_vol]
    rec_size = 20
    n = len(raw) // rec_size
    rows = []
    base = dt.replace(tzinfo=timezone.utc)
    for i in range(n):
        ms, ask, bid, av, bv = struct.unpack(">5i", raw[i*rec_size:(i+1)*rec_size])
        ts = base + timedelta(milliseconds=ms)
        rows.append((ts, ask / 1e5, bid / 1e5, av, bv))
    df = pd.DataFrame(rows, columns=["timestamp", "ask", "bid", "ask_vol", "bid_vol"])
    return df

def load_ticks_range(symbol: str, start: datetime, end: datetime) -> pd.DataFrame:
    """[start, end) のティックを時系列結合。"""
    # 時間粒度でループ（endの直前まで）
    start_h = start.replace(minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    end_h = end.replace(minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    hours = int((end_h - start_h).total_seconds() // 3600)
    chunks = []
    for h in trange(hours, desc=f"{symbol} ticks"):
        dt = start_h + timedelta(hours=h)
        df = fetch_hour_ticks(symbol, dt)
        if not df.empty:
            # 範囲で切る
            df = df[(df["timestamp"] >= start) & (df["timestamp"] < end)]
            chunks.append(df)
    if not chunks:
        return pd.DataFrame(columns=["timestamp", "ask", "bid", "ask_vol", "bid_vol"])
    out = pd.concat(chunks, ignore_index=True)
    out = out.drop_duplicates(subset=["timestamp"]).sort_values("timestamp")
    return out

def ticks_to_m1(df_ticks: pd.DataFrame) -> pd.DataFrame:
    """ティックから1分OHLCV（mid価格ベース、Volumeは合計）を作る。"""
    if df_ticks.empty:
        return pd.DataFrame(columns=["timestamp","open","high","low","close","volume"])
    # mid価格を作る（ask/bid両方あるので平均。片側しか無い用途なら片側でOK）
    px = (df_ticks["ask"] + df_ticks["bid"]) / 2.0
    df = pd.DataFrame({
        "timestamp": df_ticks["timestamp"],
        "price": px,
        "volume": (df_ticks["ask_vol"] + df_ticks["bid_vol"]).fillna(0)
    }).set_index("timestamp")

    # 1分にリサンプリング（右閉じ、UTC）
    o = df["price"].resample("1T").first()
    h = df["price"].resample("1T").max()
    l = df["price"].resample("1T").min()
    c = df["price"].resample("1T").last()
    v = df["volume"].resample("1T").sum().fillna(0)

    m1 = pd.concat([o,h,l,c,v], axis=1)
    m1.columns = ["open","high","low","close","volume"]
    m1 = m1.dropna(subset=["open","high","low","close"])  # 取引ない分は落とす
    m1 = m1.reset_index()
    return m1

def save_parquet_and_index(df_m1: pd.DataFrame, yf_symbol: str, out_base: str, source="dukascopy"):
    """指定シンボルのDFをParquet保存 & index.json を出力。"""
    if df_m1.empty:
        print(f"[WARN] No data for {yf_symbol}")
        return

    # 要件に合わせて列と並びを揃える
    df = df_m1.copy()
    df["symbol"] = yf_symbol
    df = df[["timestamp","open","high","low","close","volume","symbol"]]
    # 昇順・重複排除（UTC）
    df = df.drop_duplicates(subset=["timestamp"]).sort_values("timestamp")
    # Parquet 保存（ZSTD）
    pq_path = f"{out_base}.parquet"
    df.to_parquet(pq_path, index=False, compression="zstd")

    # index json
    rows = len(df)
    first_ts = df["timestamp"].iloc[0].isoformat()
    last_ts  = df["timestamp"].iloc[-1].isoformat()
    digest_src = f"{yf_symbol}|{rows}|{first_ts}|{last_ts}|{source}".encode()
    h = hashlib.sha256(digest_src).hexdigest()[:16]

    index = {
        "pair": yf_symbol,
        "interval": "1m",
        "rows": rows,
        "first_ts": first_ts,
        "last_ts":  last_ts,
        "dataset_hash": h,
        "source": source
    }
    with open(f"{out_base}.index.json", "w") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"✔ saved: {pq_path}")
    print(f"✔ index: {out_base}.index.json")

def build_one(symbol_raw: str, start_str: str, end_str: str):
    """EURUSD/GBPUSD/USDJPY を指定期間で作る（1分足 Parquet & index）"""
    start = datetime.fromisoformat(start_str).replace(tzinfo=timezone.utc)
    end   = datetime.fromisoformat(end_str).replace(tzinfo=timezone.utc)
    assert end > start

    yf_symbol = PAIR_MAP[symbol_raw]  # EURUSD → EURUSD=X など
    ticks = load_ticks_range(symbol_raw, start, end)
    m1 = ticks_to_m1(ticks)
    out_base = os.path.join(OUT_DIR, f"{symbol_raw}_1m_{start_str[:10]}_{end_str[:10]}")
    save_parquet_and_index(m1, yf_symbol, out_base, source="dukascopy")

if __name__ == "__main__":
    # 例：直近2ヶ月（動作確認）。本番は2年にしてOK
    start = "2023-01-01T00:00:00"
    end   = "2025-01-01T00:00:00"
    for s in ["EURUSD","GBPUSD","USDJPY"]:
        build_one(s, start, end)
