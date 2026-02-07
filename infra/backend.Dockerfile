# ---- Rust + engine-rs ビルド用 ----
FROM python:3.11-slim AS rust-builder
WORKDIR /app

# ビルドに必要なパッケージ + Rust 導入
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable \
    && . /root/.cargo/env && rustc --version

ENV PATH="/root/.cargo/bin:${PATH}"

RUN pip install --no-cache-dir maturin

COPY engine-rs /app/engine-rs
RUN cd /app/engine-rs && maturin build --release

# ---- 本番イメージ ----
FROM python:3.11-slim

WORKDIR /app

# engine_rs の wheel をインストール（Rust 拡張）
COPY --from=rust-builder /app/engine-rs/target/wheels/*.whl /tmp/wheels/
RUN pip install --no-cache-dir /tmp/wheels/*.whl && rm -rf /tmp/wheels

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY infra/DataPicker.py /app/infra/DataPicker.py
COPY infra/format_and_resample.py /app/infra/format_and_resample.py

CMD ["python", "infra/DataPicker.py"]
