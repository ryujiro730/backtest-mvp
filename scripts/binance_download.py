import requests
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta

SYMBOLS = {
    "BTCUSDT":  datetime(2017, 8, 1),
    "ETHUSDT":  datetime(2017, 8, 1),
    "BNBUSDT":  datetime(2017, 11, 1),
    "XRPUSDT":  datetime(2018, 5, 1),
    "ADAUSDT":  datetime(2018, 4, 1),
    "SOLUSDT":  datetime(2020, 8, 1),
    "DOGEUSDT": datetime(2019, 7, 1),
    "DOTUSDT":  datetime(2020, 8, 1),
    "MATICUSDT":datetime(2019, 4, 1),
    "LTCUSDT":  datetime(2017, 12, 1),
    "LINKUSDT": datetime(2019, 1, 1),
    "AVAXUSDT": datetime(2020, 9, 1),
    "TRXUSDT":  datetime(2018, 6, 1),
    "BCHUSDT":  datetime(2017, 8, 1),
    "ATOMUSDT": datetime(2019, 4, 1),
}

INTERVAL = "1m"

# 当月は未完なので先月末を終端にする
_now = datetime.utcnow()
END_DATE = datetime(_now.year, _now.month, 1) - relativedelta(months=1)
print(f"Download range: up to {END_DATE:%Y-%m}\n")

BASE_URL = "https://data.binance.vision/data/spot/monthly/klines"

for symbol, start_date in SYMBOLS.items():
    save_dir = f"./binance_data/{symbol}/{INTERVAL}"
    os.makedirs(save_dir, exist_ok=True)

    print(f"===== {symbol} =====")
    current = start_date
    downloaded = skipped = failed = 0

    while current <= END_DATE:
        year, month = current.year, current.month
        filename  = f"{symbol}-{INTERVAL}-{year}-{month:02d}.zip"
        save_path = os.path.join(save_dir, filename)

        if os.path.exists(save_path):
            skipped += 1
        else:
            url = f"{BASE_URL}/{symbol}/{INTERVAL}/{filename}"
            try:
                r = requests.get(url, timeout=60)
                if r.status_code == 200:
                    with open(save_path, "wb") as f:
                        f.write(r.content)
                    print(f"  Downloaded: {filename}")
                    downloaded += 1
                elif r.status_code == 404:
                    print(f"  Not found:  {filename}")
                    failed += 1
                else:
                    print(f"  Failed({r.status_code}): {filename}")
                    failed += 1
            except Exception as e:
                print(f"  Error: {filename} — {e}")
                failed += 1

        current += relativedelta(months=1)

    print(f"  done — downloaded={downloaded} skipped={skipped} failed={failed}\n")

print("All Done.")
