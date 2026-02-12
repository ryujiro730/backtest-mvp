# Delver プロジェクト概要（AI用コンテキスト）

このドキュメントは、Gemini などの AI がプロジェクトを短時間で理解できるようにするための要約です。

---

## 1. プロジェクトの目的とドメイン

- **名前**: Delver
- **種別**: FX・暗号資産向けの**バックテスト・検証ツール**（Webアプリ）
- **主な価値**:
  - ブラウザ上で戦略を実行し、過去データでバックテストする
  - **再現性**を重視：リプレイ時に「未来を見ない」チャート（はさみでカットしてその足より右を非表示）
  - パフォーマンスレポート（勝率・PF・ドローダウン・エクイティなど）
  - チャートでエントリー・決済を目視検証
  - 無料公開（1年間など）を前提にしたプロダクト

- **用語**:
  - **Run**: 1回のバックテスト実行。`run_id` (UUID) で一意。
  - **entry / exit**: エントリー条件・決済条件（RSI閾値、EMAクロス、TP/SL など）
  - **entry_mask**: 各バーで「エントリーする=1 / しない=0」の配列。Python で計算し Rust に渡す。
  - **replay**: チャートを時間軸で再生し、その時点までの情報だけで判断を検証する機能。
  - **H1 / M1**: 1時間足 / 1分足。チャートは H1 が主で、M1 はリプレイ用に範囲取得。

---

## 2. 技術スタック

| 層 | 技術 |
|----|------|
| フロント | Next.js (App Router), TypeScript, React, Tailwind, next-intl (日英), lightweight-charts |
| バックエンド API | FastAPI (Python), Uvicorn |
| バックテスト実行 | Celery (Redis), Python worker + **Rust エンジン** (PyO3) |
| DB | PostgreSQL (runs テーブルなど) |
| ストレージ | ローカル `data/`（Parquet）, MinIO を参照する設定もあり |
| 認証・決済 | Supabase (Auth), Stripe |
| インフラ | Docker Compose (postgres, redis, api, worker, caddy) |

- **Rust の役割**: バーループ（エントリー・決済の逐次計算）を高速化。Python は指標計算・entry_mask 構築、Rust は OHLC + entry_mask を受け取り損益・ドローダウンなどを計算。詳細は `docs/python-rust-engine-data-flow.md`。

---

## 3. リポジトリ構成（主要なだけ）

```
delver/
├── api/                    # FastAPI バックエンド
│   ├── main.py              # エントリポイント。 /api/catalog, /api/chart-data, /api/run, /api/reports/* など
│   ├── schemas.py           # リクエスト/レスポンススキーマ（StrategyMvp0 など）
│   └── routes/              # catalog, checkout など
├── worker/                  # Celery ワーカー（バックテスト実行）
│   ├── tasks.py             # run_backtest タスク
│   └── engine/              # run_logic, entry, exit, indicators, loader, save
├── engine-rs/               # Rust バックテストコア（PyO3 で Python から呼ぶ）
│   └── src/lib.rs
├── frontend/                # Next.js
│   └── src/
│       ├── app/
│       │   ├── [locale]/     # ロケール付きルート (ja/en)
│       │   │   ├── page.tsx           # LP + 即時体験（RunPanel）
│       │   │   ├── app/page.tsx       # アプリトップ（RunPanel, RulesBuilder）
│       │   │   ├── chart/page.tsx     # チャート・リプレイ・手動エントリー（約1700行）
│       │   │   ├── performance/       # パフォーマンスレポート（レポートIDでレポート表示）
│       │   │   ├── blog/              # MDX ブログ
│       │   │   └── tools/             # expected-value, risk-of-ruin など
│       │   └── api/                  # Next の API Routes（バックエンドへのプロキシ）
│       │       ├── catalog/route.ts
│       │       ├── chart-data/route.ts   # → FastAPI /api/chart-data
│       │       ├── reports/[runId]/summary|trades|equity/
│       │       └── run/start/route.ts   # バックテスト開始
│       ├── components/      # ChartArea, RunPanel, NoticeCard, Performance* など
│       ├── messages/        # ja.json, en.json（next-intl）
│       └── lib/              # backtest, stripe, supabase, strategy など
├── docs/                    # python-rust-engine-data-flow.md, catalog-data-troubleshooting.md など
├── infra/
│   ├── docker-compose.yml   # postgres, redis, api, worker, caddy
│   └── backend.Dockerfile
├── data/                    # Parquet（api から /delver/data で参照。docker では ../data をマウント）
├── migrations.sql
└── CONTEXT_FOR_AI.md        # 本ファイル
```

---

## 4. 主要なデータフロー

### 4.1 バックテスト実行

1. フロント: `RunPanel` で条件を組み、`/api/run/start`（Next）に POST。
2. Next: `FASTAPI_BASE_URL` の FastAPI `/api/run` に転送。FastAPI は DB に run を登録し、Celery に `run_backtest` を投げる。
3. Worker: `worker.engine.run_logic.run_backtest_logic` が Parquet 読み込み・指標計算・entry_mask 構築（Python）→ Rust でバーループ → 結果を `data/equity/{run_id}.json` などに保存、DB を更新。
4. フロント: run_id でポーリング（`/api/reports/{runId}/summary`）して完了を検知し、`/[locale]/performance` などに誘導。

### 4.2 チャート表示

1. フロント: `useChartData(pair, timeframe)` が `/api/chart-data?pair=...&timeframe=...&limit=...` を呼ぶ。
2. Next: `frontend/src/app/api/chart-data/route.ts` が **FASTAPI_BASE_URL** の `/api/chart-data` にプロキシ。
3. FastAPI: `api/main.py` の `_chart_data_from_parquet` で `data/` の Parquet から OHLC を読んで JSON で返す。
4. チャート画面: `ChartArea`（lightweight-charts）で表示。リプレイ時は `replayToIndex` で「その足まで」にデータを切り、未来を非表示にする。

### 4.3 パフォーマンス → チャート

- パフォーマンス画面で「チャートでエントリー確認」を押すと `/[locale]/chart?runId=...&symbol=...&timeframe=...&from=performance` に遷移。
- チャートでは `from=performance` のとき「パフォーマンス画面へ戻る」ボタンを表示。

---

## 5. 環境変数（よく使うもの）

- **バックエンド (api/worker)**  
  `POSTGRES_URL`, `REDIS_URL`, `DATASET_HASH_DEFAULT`。データは `BASE=/delver/data`（Parquet の置き場）。

- **フロント (Next.js)**  
  - `FASTAPI_BASE_URL`: バックエンドの URL。Next の API Routes（catalog, chart-data, reports）がここにプロキシする。未設定だと chart-data などが 404 になりやすい。
  - `NEXT_PUBLIC_API_BASE`: ブラウザから直接叩く API のベース（例: run 開始後のポーリング）。
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Stripe 関連など。

- **Docker**  
  `infra/docker-compose.yml` では api/worker に `../data` をマウント。フロントは compose に含まれていないことが多い（ローカルで `npm run dev` し、`FASTAPI_BASE_URL=http://localhost:8000` で api に繋ぐ想定）。

---

## 6. フロントの重要なコンポーネント・ファイル

- **chart/page.tsx**: チャート・リプレイ・手動エントリー・Run のトレードマーカー表示。`replayTime` / `replayToIndex` で「未来を消す」表示を制御。
- **ChartArea.tsx**: lightweight-charts のラップ。`bars`, `replayToIndex` で setData / setVisibleLogicalRange。クリックでリプレイ地点選択（はさみモード時）。
- **useChartData.ts**: `/api/chart-data` を呼び、bars と loadMore を提供。
- **RunPanel**: エントリー/エグジット条件と Run 実行 UI。
- **PerformanceContent / PerformanceSidebar**: パフォーマンスタブと「チャートで確認」ボタン。
- **NoticeCard**: 利用上の注意（アコーディオン。スマホは閉じ、PCは開く）。

---

## 7. 既存ドキュメント

- `docs/python-rust-engine-data-flow.md`: Python ↔ Rust のデータ渡し、ゼロコピー、並列化の考え方。
- `docs/catalog-data-troubleshooting.md`: カタログ・データまわりのトラブルシュート。
- `engine-rs/README.md`: Rust エンジンの説明。

---

## 8. 注意事項（AIが編集するとき）

- **chart-data**: フロントは必ず Next の `/api/chart-data` を呼ぶ。Next が `FASTAPI_BASE_URL` の `/api/chart-data` にプロキシする。FastAPI にだけエンドポイントを追加してもフロントからは 404 になるので、Next 側にプロキシ Route が必要。
- **locale**: ページルートは `[locale]` 配下。リンクは `/${locale}/chart` のように locale を含める。
- **i18n**: `messages/ja.json`, `en.json` のキーを追加・変更したら両方更新する。
- **Rust**: `engine-rs` を変更したあとは `maturin develop` などで Python に反映する必要がある。

---

以上を把握すれば、Delver の「何をしているプロジェクトか」「どこに何があるか」「主要な流れ」を Gemini が追いかけやすくなります。
