import pandas as pd
import glob
import os

def cleanup_eurusd_m1():
    # 1分足のEURUSDファイルのみを特定
    target_file = "data/EURUSD_M1.parquet"
    
    if not os.path.exists(target_file):
        print(f"File not found: {target_file}")
        return

    print(f"Cleaning {target_file}...")
    df = pd.read_parquet(target_file)
    
    # 元の行数を記録
    original_count = len(df)
    
    # 2.0 以上の値を異常値として除外 (EURUSDにおいて2.0はありえないため)
    # 同時に、0以下の異常値も除外
    df = df[(df['high'] < 2.0) & (df['low'] > 0.5)]
    
    removed_count = original_count - len(df)
    
    # 上書き保存
    df.to_parquet(target_file)
    print(f"Removed {removed_count} outlier rows.")
    print(f"New max high: {df['high'].max()}")
    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup_eurusd_m1()
