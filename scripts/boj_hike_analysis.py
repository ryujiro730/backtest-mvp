"""
日銀（BOJ）利上げ時のUSDJPY値動き分析
Xポスト用データ生成スクリプト
"""

import pandas as pd
import numpy as np

# =============================================
# 日銀の過去利上げ日（データ範囲内: 2000〜2024）
# =============================================
BOJ_HIKE_DATES = [
    {"date": "2006-07-14", "from_rate": "0.00%",  "to_rate": "0.25%", "label": "ゼロ金利解除"},
    {"date": "2007-02-21", "from_rate": "0.25%",  "to_rate": "0.50%", "label": "追加利上げ"},
    {"date": "2024-03-19", "from_rate": "-0.10%", "to_rate": "0.00-0.10%", "label": "マイナス金利解除"},
    {"date": "2024-07-31", "from_rate": "0.10%",  "to_rate": "0.25%", "label": "追加利上げ"},
]

def load_data():
    df = pd.read_parquet("data/USDJPY_D1.parquet")
    df.index = pd.to_datetime(df.index)
    return df

def analyze_hike(df: pd.DataFrame, hike_info: dict, window_before=10, window_after=20):
    """
    利上げ日前後の値動きを分析する
    - window_before: 利上げ前の営業日数
    - window_after:  利上げ後の営業日数
    """
    hike_date = pd.Timestamp(hike_info["date"])

    # 利上げ日に最も近いデータのインデックスを取得
    idx = df.index.searchsorted(hike_date)
    if idx >= len(df):
        return None

    actual_date = df.index[idx]

    # 前後のウィンドウ
    start_idx = max(0, idx - window_before)
    end_idx = min(len(df) - 1, idx + window_after)

    window_df = df.iloc[start_idx:end_idx + 1].copy()

    # 利上げ日の始値を基準に変化率を計算
    base_price = df.iloc[idx]["open"]

    result = {
        "label": hike_info["label"],
        "hike_date": actual_date.strftime("%Y-%m-%d"),
        "from_rate": hike_info["from_rate"],
        "to_rate": hike_info["to_rate"],
        "base_price": base_price,
        "pre_close": df.iloc[idx - 1]["close"] if idx > 0 else None,
        "hike_day_open": df.iloc[idx]["open"],
        "hike_day_close": df.iloc[idx]["close"],
        "hike_day_high": df.iloc[idx]["high"],
        "hike_day_low": df.iloc[idx]["low"],
    }

    # 利上げ当日の変化
    result["hike_day_change"] = result["hike_day_close"] - result["hike_day_open"]
    result["hike_day_change_pct"] = result["hike_day_change"] / result["hike_day_open"] * 100
    result["hike_day_range"] = result["hike_day_high"] - result["hike_day_low"]

    # 利上げ前日比
    if result["pre_close"]:
        result["vs_prev_day_pct"] = (result["hike_day_close"] - result["pre_close"]) / result["pre_close"] * 100

    # 利上げ後N日のclose（利上げ日基準）
    for n in [1, 3, 5, 10, 20]:
        future_idx = idx + n
        if future_idx <= end_idx:
            future_close = df.iloc[future_idx]["close"]
            result[f"after_{n}d_close"] = future_close
            result[f"after_{n}d_change_pct"] = (future_close - base_price) / base_price * 100

    # 利上げ前10日間のトレンド（前日比 open → close方向）
    if idx >= window_before:
        pre_window = df.iloc[start_idx:idx]
        result["pre_10d_start_close"] = pre_window.iloc[0]["close"]
        result["pre_10d_end_close"] = pre_window.iloc[-1]["close"]  # 利上げ前日
        result["pre_10d_trend_pct"] = (result["pre_10d_end_close"] - result["pre_10d_start_close"]) / result["pre_10d_start_close"] * 100

    return result

def print_report(results):
    print("=" * 65)
    print("  日銀利上げ時のUSDJPY値動き分析（Xポスト用）")
    print("=" * 65)

    for r in results:
        print(f"\n【{r['label']}】{r['hike_date']}  {r['from_rate']} → {r['to_rate']}")
        print(f"  利上げ日の始値:    {r['hike_day_open']:.3f} 円")
        print(f"  利上げ日の終値:    {r['hike_day_close']:.3f} 円")
        print(f"  当日変化:         {r['hike_day_change']:+.3f}円 ({r['hike_day_change_pct']:+.2f}%)")
        if "vs_prev_day_pct" in r:
            print(f"  前日比:           {r['vs_prev_day_pct']:+.2f}%")
        print(f"  当日レンジ:        {r['hike_day_range']:.3f}円")
        if "pre_10d_trend_pct" in r:
            print(f"  利上げ前10日トレンド: {r['pre_10d_trend_pct']:+.2f}%")
        print(f"  利上げ後の推移:")
        for n in [1, 3, 5, 10, 20]:
            key = f"after_{n}d_change_pct"
            if key in r:
                close_key = f"after_{n}d_close"
                print(f"    +{n:2d}日後: {r[close_key]:.3f}円  ({r[key]:+.2f}%)")

    print("\n" + "=" * 65)
    print("  サマリー比較（利上げ当日 open → close 変化率）")
    print("=" * 65)
    for r in results:
        bar = "▼" * int(abs(r["hike_day_change_pct"]) * 10) if r["hike_day_change_pct"] < 0 else "▲" * int(abs(r["hike_day_change_pct"]) * 10)
        print(f"  {r['hike_date']} {r['label']:12s}: {r['hike_day_change_pct']:+.2f}%  {bar}")

    print("\n" + "=" * 65)
    print("  サマリー比較（利上げ後5日間の変化率）")
    print("=" * 65)
    for r in results:
        key = "after_5d_change_pct"
        if key in r:
            bar = "▼" * int(abs(r[key]) * 2) if r[key] < 0 else "▲" * int(abs(r[key]) * 2)
            print(f"  {r['hike_date']} {r['label']:12s}: {r[key]:+.2f}%  {bar}")

    print("\n" + "=" * 65)
    print("  Xポスト用コメント案")
    print("=" * 65)
    print("""
📊 日銀利上げ時のUSDJPY実績データ

""")
    for r in results:
        d5 = r.get("after_5d_change_pct", None)
        d5_str = f"5日後: {d5:+.2f}%" if d5 else "---"
        print(f"🗓 {r['hike_date']} {r['label']}")
        print(f"   当日: {r['hike_day_change_pct']:+.2f}%　{d5_str}")
        print()

    print("※過去のデータは将来を保証しません")


def main():
    df = load_data()
    print(f"データ範囲: {df.index[0].date()} 〜 {df.index[-1].date()}")

    results = []
    for hike in BOJ_HIKE_DATES:
        r = analyze_hike(df, hike)
        if r:
            results.append(r)

    print_report(results)

    # CSVにも保存
    out_df = pd.DataFrame(results)
    out_path = "results/boj_hike_usdjpy.csv"
    import os; os.makedirs("results", exist_ok=True)
    out_df.to_csv(out_path, index=False, encoding="utf-8-sig")
    print(f"\nCSV保存: {out_path}")


if __name__ == "__main__":
    main()
