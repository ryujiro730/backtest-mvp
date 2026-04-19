import os
import pandas as pd

BASE_DIR = os.path.expanduser("~/dev/delver/scripts/binance_data")

def load_binance_to_fx_format(csv_path):
    df = pd.read_csv(csv_path)

    # 先頭6列だけ使う（Binance 1m標準想定）
    df = df.iloc[:, :6].copy()

    df.columns = ["open_time", "open", "high", "low", "close", "volume"]

    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")

    df = df.set_index("open_time")

    df = df.astype({
        "open": "float64",
        "high": "float64",
        "low": "float64",
        "close": "float64",
        "volume": "float64"
    })

    df = df.sort_index()
    df = df[~df.index.duplicated(keep="last")]

    return df


def process_symbol(symbol):
    csv_path = os.path.join(
        BASE_DIR, symbol, "1m", "all_1m.csv"
    )

    if not os.path.exists(csv_path):
        print(f"[SKIP] {symbol} no file")
        return

    print(f"[LOAD] {symbol}")

    df = load_binance_to_fx_format(csv_path)

    out_path = os.path.join(
        BASE_DIR, symbol, "1m", "all_1m.parquet"
    )

    df.to_parquet(out_path)

    print(f"[DONE] {symbol} -> {out_path} rows={len(df)}")


def main():
    symbols = [
        d for d in os.listdir(BASE_DIR)
        if os.path.isdir(os.path.join(BASE_DIR, d))
    ]

    for s in symbols:
        if s.endswith("USDT"):
            process_symbol(s)


if __name__ == "__main__":
    main()