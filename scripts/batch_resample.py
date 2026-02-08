import pandas as pd
import glob
import os

def batch_resample():
    # 1. 1分足のファイルを全て取得
    input_dir = "data"
    m1_files = glob.glob(os.path.join(input_dir, "*_M1.parquet"))
    
    if not m1_files:
        print("M1.parquetファイルが見つかりませんでした。")
        return

    # リサンプリングの定義
    timeframes = {
        'M5': '5min',
        'M30': '30min'
    }
    
    agg_dict = {
        'open': 'first',
        'high': 'max',
        'low': 'min',
        'close': 'last',
        'volume': 'sum'
    }

    for file_path in m1_files:
        # ファイル名から通貨ペア名を取得 (例: data/EURUSD_M1.parquet -> EURUSD)
        filename = os.path.basename(file_path)
        pair = filename.replace("_M1.parquet", "")
        
        print(f"--- Processing {pair} ---")
        
        # データの読み込み
        df = pd.read_parquet(file_path)
        
        # 異常値のクリーニング（前回のSummary Statsで見えた1965などの外れ値対策）
        # 通貨ペアによりますが、一旦明らかに異常な1000以上の値をカットする例
        # (XAUUSD以外で1000超えは異常。必要に応じて調整してください)
        if "XAUUSD" not in pair:
            df = df[df['high'] < 500] 

        for tf_name, rule in timeframes.items():
            print(f"  Converting to {tf_name}...")
            
            # リサンプリング実行
            resampled = df.resample(rule, label='left', closed='left').agg(agg_dict)
            
            # データがない行を削除
            resampled.dropna(subset=['open'], inplace=True)
            
            # 出力パス作成 (例: data/EURUSD_M5.parquet)
            output_filename = f"{pair}_{tf_name}.parquet"
            output_path = os.path.join(input_dir, output_filename)
            
            # 保存
            resampled.to_parquet(output_path)
            print(f"  Saved: {output_path}")

    print("\n=== All tasks completed! ===")

if __name__ == "__main__":
    batch_resample()
