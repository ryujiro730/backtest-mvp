#!/bin/bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=== Delver 起動スクリプト ===${NC}"

# .env 確認
if [ ! -f ".env" ]; then
  echo -e "${CYAN}.env が見つかりません。.env.example からコピーします...${NC}"
  cp .env.example .env
fi

# data/parquet ディレクトリ確認
if [ ! -d "data/parquet" ] || [ -z "$(ls data/parquet/*.parquet 2>/dev/null)" ]; then
  echo -e "${RED}エラー: data/parquet/ に .parquet ファイルが見つかりません。${NC}"
  echo ""
  echo "  1. 配布された parquet ファイルを data/parquet/ に配置してください"
  echo "  例: data/parquet/EURUSD_H1.parquet"
  echo ""
  exit 1
fi

echo -e "${GREEN}データファイルを確認:${NC}"
ls data/parquet/*.parquet | xargs -I{} basename {}

# Docker 確認
if ! command -v docker &> /dev/null; then
  echo -e "${RED}エラー: Docker がインストールされていません。${NC}"
  echo "  https://www.docker.com/products/docker-desktop/ からインストールしてください"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}エラー: Docker Desktop が起動していません。${NC}"
  echo "  Docker Desktop を起動してから再実行してください"
  exit 1
fi

echo -e "${CYAN}Docker Compose でサービスを起動します...${NC}"
docker compose up -d --build

echo -e "${CYAN}起動待機中...${NC}"
for i in $(seq 1 60); do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}起動完了！${NC}"
    break
  fi
  sleep 2
  echo -n "."
  if [ $i -eq 60 ]; then
    echo -e "${RED}タイムアウト。ログを確認: docker compose logs${NC}"
    exit 1
  fi
done

echo ""
echo -e "${GREEN}ブラウザで開きます: http://localhost:3000${NC}"

# ブラウザを開く（OS判定）
if command -v xdg-open &> /dev/null; then
  xdg-open "http://localhost:3000/ja/app"
elif command -v open &> /dev/null; then
  open "http://localhost:3000/ja/app"
fi
