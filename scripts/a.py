import os
import pandas as pd

BASE_DIR = os.path.expanduser("~/dev/delver/scripts/binance_data")


def inspect_parquet(symbol):
    path = os.path.join(BASE_DIR, symbol, "1m", "all_1m.parquet")

    if not os.path.exists(path):
        print(f"[SKIP] {symbol}")
        return

    df = pd.read_parquet(path)

    print("\n" + "="*50)
    print(f"[{symbol}]")
    print("="*50)

    print("shape:", df.shape)
    print("columns:", df.columns.tolist())
    print(df.head(3))
    print(df.tail(3))

    # 時系列チェック
    if isinstance(df.index, pd.DatetimeIndex):
        print("start:", df.index.min())
        print("end  :", df.index.max())

        diff = df.index.to_series().diff().value_counts().head(3)
        print("\ninterval check:")
        print(diff)

    # 欠損チェック
    print("\nnulls:")
    print(df.isnull().sum())

    # 基本統計
    print("\nstats:")
    print(df.describe().T)


def main():
    symbols = [
        d for d in os.listdir(BASE_DIR)
        if os.path.isdir(os.path.join(BASE_DIR, d))
    ]

    for s in sorted(symbols):
        if s.endswith("USDT"):
            inspect_parquet(s)


if __name__ == "__main__":
    main()