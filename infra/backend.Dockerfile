FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 既存の DataPicker.py と同じように format_and_resample.py もコピー
COPY infra/DataPicker.py /app/infra/DataPicker.py
COPY infra/format_and_resample.py /app/infra/format_and_resample.py

CMD ["python", "infra/DataPicker.py"]
