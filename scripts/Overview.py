import pandas as pd

df = pd.read_parquet("/home/tsujiryujiro/Documents/backtest-mvp/scripts/64b48e332aeedbbf.parquet")
# 基本情報
print("=== Data Overview ===")
print(df.info())

print("\n=== Head ===")
print(df.head())

print("\n=== Tail ===")
print(df.tail())

# 期間や件数
if "timestamp" in df.columns:
    print("\n=== Time Range ===")
    print("Start:", df["timestamp"].min())
    print("End  :", df["timestamp"].max())
    print("Total rows:", len(df))

# 数値カラムの統計量
print("\n=== Summary Stats ===")
print(df.describe())