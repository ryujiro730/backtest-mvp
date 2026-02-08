import pandas as pd
import glob
import os

def cleanup_all_eurusd():
    # 1. EURUSDと名のつく全てのParquetファイルを取得
    files = glob.glob("data/EURUSD_*.parquet")
    
    for f in files:
        print(f"Checking {f}...")
        df = pd.read_parquet(f)
        
        # 異常値(2.0以上、0.5以下)があるか確認
        outliers = df[(df['high'] > 2.0) | (df['low'] < 0.5)]
        
        if len(outliers) > 0:
            print(f"  -> Found {len(outliers)} outliers! Cleaning...")
            # 正常な範囲だけに絞り込む
            df = df[(df['high'] < 2.0) & (df['low'] > 0.5)]
            df.to_parquet(f)
            print(f"  -> Cleaned and saved. New max: {df['high'].max()}")
        else:
            print(f"  -> No outliers found. Max: {df['high'].max()}")

if __name__ == "__main__":
    cleanup_all_eurusd()
