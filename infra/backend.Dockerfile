# ---- Stage 1: Rust engine build ----
FROM python:3.11-slim AS rust-builder
WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libffi-dev curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable

ENV PATH="/root/.cargo/bin:${PATH}"

RUN pip install --no-cache-dir maturin

COPY engine-rs /build/engine-rs
RUN cd /build/engine-rs && maturin build --release

# ---- Stage 2: Runtime image ----
FROM python:3.11-slim

WORKDIR /delver

COPY --from=rust-builder /build/engine-rs/target/wheels/*.whl /tmp/wheels/
RUN pip install --no-cache-dir /tmp/wheels/*.whl && rm -rf /tmp/wheels

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /delver/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY api /delver/api
COPY worker /delver/worker
