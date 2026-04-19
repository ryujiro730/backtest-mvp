import pandas as pd
import numpy as np

def detect_time_anomalies(all_data: dict):
    """
    all_data: {"BTCUSDT": df, "ETHUSDT": df, ...}
    df index must be datetime
    """

    report = {}

    for symbol, df in all_data.items():
        print(f"\n===== {symbol} =====")

        idx = df.index

        # 1. 基本統計
        min_t, max_t = idx.min(), idx.max()

        # 2. 未来日付検知（常識チェック）
        future = df[idx > pd.Timestamp("2100-01-01")]
        
        # 3. 重複チェック
        dup = idx.duplicated().sum()

        # 4. ソート崩れチェック
        is_monotonic = idx.is_monotonic_increasing

        # 5. interval分析
        diffs = idx.to_series().diff().dropna()

        interval_counts = diffs.value_counts().head(10)

        # 6. 異常interval検出（1分足前提）
        abnormal_intervals = diffs[~diffs.isin([
            pd.Timedelta(minutes=1)
        ])]

        # 7. 極端なジャンプ（データ壊れ検知）
        huge_jumps = diffs[diffs > pd.Timedelta(days=1)]

        # 8. 明らかなtimestamp破損（例: 16:40パターン検出）
        weird_1640 = diffs[diffs == pd.Timedelta(hours=16, minutes=40)]

        report[symbol] = {
            "start": str(min_t),
            "end": str(max_t),
            "duplicates": int(dup),
            "monotonic": bool(is_monotonic),
            "future_rows": len(future),
            "abnormal_intervals": len(abnormal_intervals),
            "huge_jumps": len(huge_jumps),
            "weird_16h40m": len(weird_1640),
            "top_intervals": interval_counts.to_dict()
        }

        print(report[symbol])

    return report