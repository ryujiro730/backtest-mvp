import os
import zipfile
import glob
import re

BASE_DIR = os.path.expanduser("~/dev/delver/scripts/binance_data")
OUTPUT_NAME = "all_1m.csv"

def extract_ym(path):
    m = re.search(r'\d{4}-\d{2}', path)
    return m.group(0) if m else ""

def merge_symbol(symbol):
    target_dir = os.path.join(BASE_DIR, symbol, "1m")
    zip_files = sorted(glob.glob(os.path.join(target_dir, "*.zip")), key=extract_ym)

    if not zip_files:
        print(f"[{symbol}] zipなし")
        return

    out_path = os.path.join(target_dir, OUTPUT_NAME)

    print(f"[{symbol}] {len(zip_files)} files -> {out_path}")

    with open(out_path, "wb") as out:
        for i, zpath in enumerate(zip_files):
            with zipfile.ZipFile(zpath) as z:
                name = z.namelist()[0]
                with z.open(name) as f:
                    # ★完全ストリームコピー（decodeしない＝最速＆省メモリ）
                    while chunk := f.read(1024 * 1024):
                        out.write(chunk)

            out.write(b"\n")  # 保険

            print(f"[{symbol}] {i+1}/{len(zip_files)} {os.path.basename(zpath)}")

def main():
    symbols = [d for d in os.listdir(BASE_DIR)
               if os.path.isdir(os.path.join(BASE_DIR, d))]

    for s in symbols:
        if s.endswith("USDT"):
            merge_symbol(s)

if __name__ == "__main__":
    main()