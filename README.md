# Delver — ローカル版

FXバックテスト検証ツール。Docker Compose で自分のPCで完全動作します。

## 前提

- **Docker Desktop** がインストール・起動済みであること
  - Mac/Windows: https://www.docker.com/products/docker-desktop/
  - 推奨スペック: RAM 4GB 以上、ストレージ 5GB 以上の空き

## セットアップ手順

### 1. ZIPを展開

配布されたZIPを任意の場所に展開します。

### 2. データファイルを配置

配布された `.parquet` ファイルを `data/parquet/` フォルダに入れます。

```
delver/
└── data/
    └── parquet/
        ├── EURUSD_H1.parquet
        ├── EURUSD_M15.parquet
        └── ...
```

ファイル名の形式: `{通貨ペア}_{時間足}.parquet`

### 3. 起動

**Mac / Linux:**
```bash
./start.sh
```
またはダブルクリック（実行権限が必要な場合: `chmod +x start.sh`）

**Windows:**
`start.bat` をダブルクリック

### 4. ブラウザで開く

起動完了後、自動でブラウザが開きます。手動で開く場合:

```
http://localhost:3000/ja/app
```

## 停止方法

```bash
docker compose down
```

## ログ確認

```bash
docker compose logs -f
```

## トラブルシューティング

### 「データファイルが見つかりません」と表示される
→ `data/parquet/` に `.parquet` ファイルを配置してください

### ブラウザが開かない
→ Docker Desktop が起動しているか確認し、`docker compose up -d` を再実行してください

### ポートが使用中エラー
→ 3000番または8000番ポートを使っているアプリを停止してください

## ディレクトリ構成

```
delver/
├── docker-compose.yml   # Docker設定
├── start.sh             # Mac/Linux 起動スクリプト
├── start.bat            # Windows 起動スクリプト
├── .env.example         # 環境変数テンプレート
├── .env                 # 実際の環境変数（初回起動時に自動生成）
├── data/
│   └── parquet/         # 為替データ（別途配布）
├── api/                 # FastAPI バックエンド
├── worker/              # Celery ワーカー
├── frontend/            # Next.js フロントエンド
└── engine-rs/           # Rust バックテストエンジン
```
