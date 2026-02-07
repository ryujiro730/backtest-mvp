# engine-rs

Delver バックテストエンジンのコアを Rust で実装し、Python (worker) から PyO3 で呼び出す。

## セットアップ

- Rust: https://rustup.rs/
- Python 3.10+

**プロジェクトで venv を使う場合（推奨）:**

```bash
# リポジトリ直下で venv が無ければ作成
cd /path/to/delver
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# engine-rs をビルドしてこの venv にインストール
cd engine-rs
pip install maturin
maturin develop
```

**すでに venv を有効にしている場合:**

```bash
cd engine-rs
pip install maturin
maturin develop
```

`maturin develop` で、現在有効な Python 環境に `engine_rs` がインストールされ、`import engine_rs` で使えるようになる。

## Python から使う

```python
import engine_rs

equity = engine_rs.run_engine_core(
    open=[...],
    high=[...],
    low=[...],
    close=[...],
    entry_mask=[0,0,1,0,...],  # 0/1
    direction_long=True,
    lot_size=0.1,
    sl_pips=20.0,
    tp_r_multiple=2.0,
    pip_size=0.0001,
)
```

## 次のステップ

1. `run_engine_core` 内で実際のバーループ（エントリー・SL/TP 決済・equity 積み）を実装
2. worker の `engine.py` から、テスト用の小さな df でこの関数を呼び、既存結果と一致するか検証
