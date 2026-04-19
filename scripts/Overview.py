import pandas as pd

##df = pd.read_csv("/home/tj/dev/delver/scripts/binance_data/ADAUSDT/1m/all_1m.csv")
df = pd.read_parquet("/home/tj/dev/delver/data/BTCUSDT_M1.parquet")
##df.to_parquet(
##    "/home/tj/dev/delver/scripts/binance_data/ADAUSDT/1m/all_1m.parquet",
##    index=False
## )
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
