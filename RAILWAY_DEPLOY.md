# Railway デプロイ手順

## 構成

| サービス | 用途 | Dockerfile |
|---|---|---|
| `api` | FastAPI (HTTP API) | `infra/Dockerfile.api` |
| `worker` | Celery worker (バックテスト実行) | `infra/Dockerfile.worker` |
| `frontend` | Next.js | `frontend/` |
| Redis | タスクキュー | Railway plugin |
| PostgreSQL | 実行記録 + 結果 | Supabase (外部) |

**注**: Railway はサービス間でファイルシステムを共有できないため、
- 戦略 JSON と結果 (equity/trades) は PostgreSQL の `runs` テーブルに保存
- parquet データは Cloudflare R2 (または S3) に置き、起動時にダウンロード

---

## 前提条件

```bash
# Railway CLI インストール
npm install -g @railway/cli

# ログイン
railway login
```

---

## Step 1: parquet ファイルを R2/S3 にアップロード

```bash
# Cloudflare R2 の場合 (aws CLI を使用)
aws s3 cp data/ s3://your-bucket-name/ \
  --recursive \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com \
  --exclude "*" \
  --include "*.parquet"

# アップロード確認
aws s3 ls s3://your-bucket-name/ \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com
```

必要なファイル例:
- `EURUSD_H1.parquet`
- `EURUSD_M15.parquet`
- etc.

---

## Step 2: Railway プロジェクト作成

```bash
cd /path/to/delver

# プロジェクト作成 (初回のみ)
railway init

# または既存プロジェクトにリンク
railway link
```

---

## Step 3: Redis plugin 追加

```bash
railway add --plugin redis
```

Railway ダッシュボードで Redis が追加されると `REDIS_URL` が自動設定される。

---

## Step 4: 環境変数を設定

### api サービス

```bash
railway service api

railway variables set \
  POSTGRES_URL="postgresql://user:pass@db.supabase.co:5432/postgres" \
  REDIS_URL="${{Redis.REDIS_URL}}" \
  DATASET_HASH_DEFAULT="EURUSD_H1"
```

### worker サービス

```bash
railway service worker

railway variables set \
  POSTGRES_URL="postgresql://user:pass@db.supabase.co:5432/postgres" \
  REDIS_URL="${{Redis.REDIS_URL}}" \
  DATASET_HASH_DEFAULT="EURUSD_H1" \
  DATA_DIR="/delver/data" \
  PARQUET_BUCKET="your-bucket-name" \
  AWS_ACCESS_KEY_ID="your-r2-access-key" \
  AWS_SECRET_ACCESS_KEY="your-r2-secret-key" \
  AWS_ENDPOINT_URL="https://<account-id>.r2.cloudflarestorage.com"
```

### frontend サービス

```bash
railway service frontend

railway variables set \
  FASTAPI_BASE_URL="http://api.railway.internal:$PORT" \
  NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  NEXT_PUBLIC_FREE_MODE="1"
```

> **注**: `FASTAPI_BASE_URL` の `$PORT` は Railway ダッシュボードで `api` サービスの実際のポート番号に置き換える。Railway の Private Networking を使う場合は `http://api.railway.internal:8000` のような形式。

---

## Step 5: デプロイ

```bash
# 全サービスをデプロイ
railway up

# 特定サービスのみ
railway up --service api
railway up --service worker
railway up --service frontend
```

---

## Step 6: DB マイグレーション

Supabase の SQL エディタで `migrations.sql` を実行:

```bash
# または psql で直接実行
psql "postgresql://user:pass@db.supabase.co:5432/postgres" -f migrations.sql
```

---

## Step 7: 動作確認

```bash
# API ヘルスチェック
curl https://your-api.railway.app/health

# カタログ確認 (parquet が見えるか)
curl https://your-api.railway.app/api/catalog

# フロントエンド
open https://your-frontend.railway.app
```

---

## ログ確認

```bash
# api ログ
railway logs --service api

# worker ログ
railway logs --service worker
```

---

## トラブルシューティング

### worker が parquet を見つけられない
- `PARQUET_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL` を確認
- worker ログで `[LOADER] downloading ...` が出ているか確認

### run_id not found エラー
- `POSTGRES_URL` が api と worker で同じ Supabase を指しているか確認
- `migrations.sql` を実行したか確認 (runs テーブルに `payload`, `equity_data`, `trades_data` カラムが必要)

### frontend から API に繋がらない
- `FASTAPI_BASE_URL` が Railway の Private Networking URL になっているか確認
- Railway ダッシュボード → api サービス → Settings → Networking で内部 URL を確認
