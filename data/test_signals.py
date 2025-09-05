# test_signals.py （.venvで実行）
import pandas as pd
from pathlib import Path

ROOT = Path("~/Documents/backtest-mvp/data").expanduser()
sym = "EURUSD"
tf  = "H1"          # M15やD1でも可
fp = ROOT / tf / f"{sym}_{tf}.parquet"

df = pd.read_parquet(fp)
print("rows:", len(df), "range:", df["timestamp"].min(), "→", df["timestamp"].max())
print("unique closes:", df["close"].nunique(), "nonzero close:", (df["close"]!=0).sum())

# RSI(14)（自作: pandasだけで）
delta = df["close"].diff()
gain  = delta.clip(lower=0)
loss  = -delta.clip(upper=0)
roll  = 14
avg_gain = gain.rolling(roll, min_periods=roll).mean()
avg_loss = loss.rolling(roll, min_periods=roll).mean()
rs = avg_gain / (avg_loss.replace(0, 1e-12))
rsi = 100 - (100/(1+rs))
df["rsi"] = rsi

# 発生数とクロス回数
above70 = (df["rsi"] > 70).sum()
below30 = (df["rsi"] < 30).sum()
cross_up   = ((df["rsi"].shift(1) < 30) & (df["rsi"] >= 30)).sum()
cross_down = ((df["rsi"].shift(1) > 70) & (df["rsi"] <= 70)).sum()

print(f"RSI>70: {above70}, RSI<30: {below30}, cross_up: {cross_up}, cross_down: {cross_down}")
