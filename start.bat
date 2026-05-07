@echo off
chcp 65001 >/dev/null
setlocal

echo === Delver 起動スクリプト ===

:: .env 確認
if not exist ".env" (
  echo .env が見つかりません。.env.example からコピーします...
  copy .env.example .env >/dev/null
)

:: data/parquet 確認
if not exist "data\parquet" (
  echo エラー: data\parquet\ フォルダが存在しません。
  echo 配布された parquet ファイルを data\parquet\ に配置してください。
  pause
  exit /b 1
)

dir /b "data\parquet\*.parquet" >/dev/null 2>&1
if errorlevel 1 (
  echo エラー: data\parquet\ に .parquet ファイルが見つかりません。
  echo 配布された parquet ファイルを data\parquet\ に配置してください。
  pause
  exit /b 1
)

:: Docker 確認
docker info >/dev/null 2>&1
if errorlevel 1 (
  echo エラー: Docker Desktop が起動していません。
  echo Docker Desktop を起動してから再実行してください。
  pause
  exit /b 1
)

echo Docker Compose でサービスを起動します...
docker compose up -d --build
if errorlevel 1 (
  echo エラー: docker compose up に失敗しました。
  pause
  exit /b 1
)

echo 起動待機中...
:WAIT_LOOP
timeout /t 3 /nobreak >/dev/null
curl -sf http://localhost:3000 >/dev/null 2>&1
if not errorlevel 1 goto READY
echo .
goto WAIT_LOOP

:READY
echo 起動完了！
echo ブラウザで開きます: http://localhost:3000/ja/app
start "" "http://localhost:3000/ja/app"
endlocal
