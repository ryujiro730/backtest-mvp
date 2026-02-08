# 銘柄・時間足が表示されない場合（カタログが空）

## 原因

- フロントの銘柄／時間足は **`GET /api/catalog`** の結果で表示される。
- バックエンド（`api/main.py`）は **`/delver/data`** ディレクトリ内の `*.parquet` を列挙してカタログを組み立てている（ファイル名が `EURUSD_M15.parquet` 形式であること）。

## VPS アップグレード後に消える理由

1. **データディレクトリが存在しない・空**
   - 新サーバーでは `/delver/data`（またはマウント元）が作られておらず、parquet が1つもない。
2. **ボリューム／マウントが変わった**
   - Docker の場合: `docker-compose` で `..:/delver` をマウントしているため、**ホストのプロジェクトルートの `data/`** がコンテナの `/delver/data` になる。  
     → VPS のプロジェクトパスやマウント先が変わると、`data/` が別の場所になり空になる。
3. **データを移していない**
   - 旧 VPS にあった `data/*.parquet` を新 VPS にコピーしていない、または別ボリュームに置いたままマウントしていない。

## 確認手順（VPS上）

1. API が動いているホスト／コンテナで:
   ```bash
   ls -la /delver/data
   ```
   - ディレクトリが無い、または中に `*.parquet` が無い → ここが原因。

2. Docker の場合、プロジェクトルートの `data/` がコンテナに入っているか:
   ```bash
   docker compose exec api ls -la /delver/data
   ```

3. 直接 API を叩く:
   ```bash
   curl -s https://あなたのドメイン/api/catalog
   ```
   - `{"pairs":[],"timeframes":[],"items":[]}` ならカタログが空（データ不足 or パス問題）。

## 対処

- **`/delver/data` を作成し、その中に `EURUSD_M15.parquet` など `<銘柄>_<時間足>.parquet` 形式のファイルを配置する。**
- Docker で `..:/delver` なら、ホストのリポジトリ直下に `data/` を作り、その中に parquet を置く。
- データは `scripts/fetch_datasets_multi.fixed.py` や S3 等で用意し、同じパスに配置する。

## コード上の変更（本リポジトリ）

- `_catalog()` で `/delver/data` が無い、または `listdir` に失敗した場合は **500 を返さず空のカタログ** を返すようにした。  
  → 原因は「データが無い／パスが違う」と判断しやすく、ログに `Catalog: BASE ... does not exist or is not a directory` が出る。
