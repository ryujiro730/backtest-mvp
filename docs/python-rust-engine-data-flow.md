# Python ↔ Rust エンジン データフローとメモリ

## 0. 実装済みの改善（2025）

- **run_engine_core**: OHLC と entry_mask を `as_slice()` で受け取り **ゼロコピー**。`to_vec()` は廃止。
- **run_engine_core_native**: Python は OHLC と `entries_config_json` / `opposite_config_json` のみ渡す。Rust 側で **ta クレート**で RSI・EMA を計算し、**Rayon** で指標を並列計算してからエントリーマスクを組み立て、バーループはゼロコピーで実行。1 ブロックで rsi_threshold / ema_cross のみの戦略は Python でマスクを組まず native パスになる。
- **並列化**:
  - **バーループ**: 1 本の時系列では **並列化しない**。バー i のポジション・決済がバー i+1 のエントリーに依存するため、ループは必ず直列。
  - **指標計算（Rust）**: `rayon::join` で RSI / EMA fast / EMA slow + ダミー の 4 タスクに分け、4 コアで並列実行。Rayon はデフォルトで `num_cpus()` のスレッドを使う。
  - **マスク構築（Python, direction=both）**: `ThreadPoolExecutor(max_workers=2)` で pos_long と pos_short を **同時に** `build_entry_mask`。numpy/pandas は GIL を解放することが多いため、2 スレッドでも短縮が見込める。
  - **複数バックテスト**: 4 コアを活かすには、**Celery の worker を 4 プロセス**にすると、4 件のリクエストが同時に別コアで動く（各リクエスト内のバーループは 1 スレッド）。

---

## 1. 今、Rust に何を渡しているか？

**答え: 価格の生データ（OHLC）と、Python で計算済みの「エントリーマスク」だけ。**

- **Rust に渡しているもの**
  - `open`, `high`, `low`, `close` … 価格の生データ（float64 配列）
  - `entry_mask` … エントリーするバーが 1 の u8 配列（Python で事前計算）
  - `entry_mask_opposite` … 反対シグナル用の u8 配列（同上）

- **Rust に渡していないもの**
  - RSI・EMA・ATR・MACD・BB などの**テクニカル指標の計算結果**は一切渡していない。
  - 指標はすべて **Python 側**で計算され、`build_entry_mask()` 内で「RSI 閾値」「EMA クロス」などの条件評価に使われ、その結果が `entry_mask` という 0/1 のマスクにまとめられて Rust に渡る。

つまり「テクニカル指標の計算結果を Pandas/Numpy の配列として Rust に渡している」のではなく、「**価格の生データと、Python で作ったエントリー用の 0/1 マスクだけ**」を渡している。

---

## 2. テクニカル指標を Rust 側で完結させられるか？

**結論: 設計上は可能。ただし engine.rs の役割を「バーループだけ」から「指標計算＋エントリー評価＋バーループ」に広げる必要がある。**

- **現状**
  - `engine.rs` は **バーループのみ**: `entry_mask[i]` の 0→1 でエントリー、SL/TP/時間/反対シグナルで決済。指標は一切計算していない。
  - 指標計算とエントリー条件の評価はすべて **Python**:
    - `worker/engine/indicators.py` … RSI, EMA, ATR, MACD, BB など
    - `worker/engine/entry.py` … `build_entry_mask()` が各条件（rsi_threshold, ema_cross 等）を `df` と指標を使って評価し、マスクを組み立て

- **Rust で完結させる場合に必要なこと**
  1. **Rust 側に指標計算を実装**
     - RSI, EMA, SMA, ATR, MACD, Bollinger 等を Rust で実装（または既存 crate を利用）。
  2. **エントリー条件の評価を Rust で行う**
     - `entries` / `entry_blocks` の設定（JSON 的な構造）を Rust に渡し、「このバーで RSI cross_up か」「EMA above か」などを Rust 内で判定して `entry_mask` を組み立てる。
  3. **Python 側の pd.DataFrame 利用を減らす**
     - 渡すのは `df` 全体ではなく、OHLC の生配列 ＋ `entries`/`entry_blocks` 設定だけにし、Rust が「指標計算 → マスク構築 → バーループ」まで一気にやる形にする。

そうすれば「Python で pd.DataFrame をいじる箇所」は、データ読み込み・前処理・結果の整形程度に減らせる。ただし、entry の種類（rsi_threshold, ema_cross, time_window, price_action 等）が多く、Rust 側の実装と Python スキーマの同期が必要になる。

---

## 3. Python → Rust のデータ渡し: コピーか View か？

**答え: 現状は「コピー」している。View にすればコピーなしにできる。**

### 現状（engine-rs/src/lib.rs）

```rust
fn array_like_to_f64_vec(arr: &PyArrayLike1<'_, f64>) -> PyResult<Vec<f64>> {
    let s = arr
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    Ok(s.to_vec())   // ← ここで .to_vec() により新しい Vec へコピーしている
}
```

- `PyArrayLike1` の `.as_slice()` は、numpy 配列が C-contiguous なら **参照（&[f64]）** を返し、ゼロコピーで読める。
- しかしその直後に **`.to_vec()`** を呼んでいるため、**毎回新しい `Vec<f64>` を確保し、スライスをコピー**している。
- コメントの「.tolist() コピーを避ける」は「Python の .tolist() でリストに変換して渡すのを避けている」という意味で正しいが、「Rust 側でコピーしていない」という意味ではない。

### ゼロコピーにするには

- `.to_vec()` をやめ、**`as_slice()` で得た `&[f64]` をそのままバーループで使う**。
- スライスのライフタイムは、元の `PyArrayLike1`（および背後にある numpy 配列）が有効な間だけ有効。`run_engine_core` の引数で受け取った `PyArrayLike1` を関数内で保持したままループでだけ使うなら、スライスはループ全体で有効にできる。
- 例（イメージ）:
  - `let open_slice = open.as_slice()?;` のように参照だけ取り、`open_slice[i]` でアクセス。
  - `open_slice` をループ内で使い、`Vec` に変換しない。

Python 側ではすでに `np.ascontiguousarray(..., dtype=np.float64)` で C-contiguous な配列を渡しているので、Rust 側で `as_slice()` が失敗せず参照を返す前提は満たしやすい。

---

## まとめ

| 質問 | 答え |
|------|------|
| 指標の計算結果を Rust に渡している？ | **いいえ。** 渡しているのは価格（OHLC）と **Python で計算した entry_mask のみ**。 |
| 価格の生データだけ渡して Rust で計算している？ | **いいえ。** 指標は Python で計算し、その結果でマスクを作ってから Rust に渡している。 |
| engine.rs で指標計算を完結させられる？ | **設計上は可能。** 指標＋エントリー評価＋バーループを Rust に寄せれば、Python の DataFrame 操作はかなり減らせる。 |
| メモリはコピーか View か？ | **現状はコピー。** `as_slice()` の後に `.to_vec()` しているため。`.to_vec()` をやめてスライスのまま使えば View（ゼロコピー）にできる。 |
