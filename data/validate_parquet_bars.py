from pathlib import Path
import sys
import argparse
import pandas as pd
import numpy as np
import re
import datetime as dt

REQUIRED = ["timestamp", "open", "high", "low", "close", "volume"]
SEC_BY_TF = {"M1": 60, "M15": 15*60, "H1": 60*60, "D1": 24*60*60}

def infer_symbol(fname: str) -> str:
    m = re.search(r"([A-Z]{3,7})_(M1|M15|H1|D1)\.parquet$", fname)
    return m.group(1) if m else Path(fname).stem

def check_df(df: pd.DataFrame, tf: str) -> list[str]:
    errs = []
    # 必須列
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        errs.append(f"missing cols: {missing}")
        return errs

    # 型・欠損
    if df.empty:
        errs.append("empty dataframe")
        return errs

    # 型/NaN
    for c in ["open","high","low","close","volume"]:
        if not np.issubdtype(df[c].dtype, np.number):
            errs.append(f"{c} not numeric (dtype={df[c].dtype})")
    if df[REQUIRED].isna().any().any():
        na_cols = df[REQUIRED].columns[df[REQUIRED].isna().any()].tolist()
        errs.append(f"has NaN in {na_cols}")

    # ソート & 重複
    if not df["timestamp"].is_monotonic_increasing:
        errs.append("timestamp not sorted ascending")
    if df["timestamp"].duplicated().any():
        dup_cnt = int(df["timestamp"].duplicated().sum())
        errs.append(f"duplicate timestamps: {dup_cnt}")

    # 値の妥当性
    if (df["volume"] < 0).any():
        errs.append("volume has negatives")
    # OHLC 整合
    ohlc_max = pd.concat([df["open"], df["close"], df["low"]], axis=1).max(axis=1)
    ohlc_min = pd.concat([df["open"], df["close"], df["high"]], axis=1).min(axis=1)
    if (df["high"] + 0 < ohlc_max - 1e-12).any():
        errs.append("high < max(open,close,low)")
    if (df["low"] - 0 > ohlc_min + 1e-12).any():
        errs.append("low > min(open,close,high)")

    # close 全ゼロ
    if (df["close"] == 0).all():
        errs.append("close all zeros")

    # タイムフレーム整合（差分が基準秒の倍数）
    base = SEC_BY_TF.get(tf)
    if base:
        # pandas Timedelta to seconds
        dsec = df["timestamp"].diff().dropna().dt.total_seconds().abs()
        # 日足は 24h の倍数（夏時間ずれ等は±2hまで許容）
        if tf == "D1":
            # 大きなズレが頻発してないかだけ確認
            bad = (dsec % 86400 != 0) & (np.abs(dsec - 86400) > 7200)
            if bad.any():
                errs.append("D1 gaps not near 24h multiples")
        else:
            bad = (dsec % base != 0)
            if bad.any():
                bad_ratio = float(bad.mean())
                if bad_ratio > 0.01:  # 1%超なら警告
                    errs.append(f"time diffs not multiples of {base}s (bad {bad_ratio:.1%})")

    return errs

def validate_dir(root: Path, tf: str) -> list[dict]:
    rows = []
    for fp in sorted((root/tf).glob("*.parquet")):
        try:
            df = pd.read_parquet(fp)
        except Exception as e:
            rows.append({"file": str(fp), "tf": tf, "symbol": infer_symbol(fp.name),
                         "status": "FAIL", "reason": f"read error: {e}"})
            continue
        errs = check_df(df, tf)
        rows.append({
            "file": str(fp),
            "tf": tf,
            "symbol": infer_symbol(fp.name),
            "rows": len(df),
            "start": df["timestamp"].iloc[0] if len(df) else None,
            "end": df["timestamp"].iloc[-1] if len(df) else None,
            "status": "OK" if not errs else "FAIL",
            "reason": "; ".join(errs) if errs else ""
        })
    return rows

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.environ.get("DATA_ROOT", "/data"),
                    help="data root (default: /data or $DATA_ROOT)")
    ap.add_argument("--report", default="", help="write CSV report to this path")
    ap.add_argument("--strict-exit", action="store_true", help="exit 1 if any FAIL")
    args = ap.parse_args()

    root = Path(args.root).expanduser()
    results = []
    for tf in ["M1","M15","H1","D1"]:
        if not (root/tf).exists():
            print(f"[WARN] {root/tf} not found; skip")
            continue
        results += validate_dir(root, tf)

    if not results:
        print("[WARN] no files checked.")
        sys.exit(0)

    df = pd.DataFrame(results)
    ok = (df["status"] == "OK").sum()
    fail = (df["status"] == "FAIL").sum()
    print("\n=== Validation Summary ===")
    print(df.groupby(["tf","status"]).size().unstack(fill_value=0))
    print(f"\nTotal OK={ok}, FAIL={fail}")
    if fail:
        print("\n--- Failures ---")
        # 失敗だけ見やすく表示
        for _, r in df[df["status"]=="FAIL"].iterrows():
            print(f"{r['tf']:>3} {r['symbol']}: {r['reason']}  ({r['file']})")

    if args.report:
        report_path = Path(args.report).expanduser()
        report_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(report_path, index=False)
        print(f"\nWrote report: {report_path}")

    if fail and args.strict_exit:
        sys.exit(1)

if __name__ == "__main__":
    import os
    main()
