export const TEXT = {
  // ===== Header =====
  title: "FXバックテスト（EMAクロス・ATRトレーリング）｜無料検証ツール",
  beta: "BETA",

  // ===== Beta Notice =====
  betaNoteTitle: "注意（ベータ版）",
  betaNotes: [
    "現在は 2018 年のデータのみ対応しています。今後拡張予定です。",
    "バックテスト結果はシミュレーションであり、将来の成績を保証するものではありません。",
    "取引コストおよびスリッページは概算値です。",
    "機能は予告なく変更・一時停止される場合があります。",
    "Run ボタンをクリックした時点で、利用規約に同意したものとみなされます。",
    "フィードバック: info@delvertrade.com",
  ],

  // ===== Catalog / System =====
  catalogLoading:
    "カタログを読み込み中、またはデータセットが見つかりません。/api/catalog と MinIO のインデックスを確認してください。",
  catalogLoadFailed: "カタログの読み込みに失敗しました",

  // ===== Sections =====
  strategyParams: "戦略パラメータ",
  exitParams: "決済 / トレーリング / コスト",
  results: "結果",

  // ===== Common Labels =====
  pair: "通貨ペア",
  timeframe: "時間足",
  direction: "方向",

  long: "ロング",
  short: "ショート",
  both: "両方向",

  // ===== Entry =====
  entry: "エントリー",
  longEntry: "ロングエントリー",
  shortEntry: "ショートエントリー",
  entryType: "エントリータイプ",

  // ===== Entry Types (UI表示用) =====
  entryTypes: {
    ema_cross: "EMA クロス",
    breakout: "ブレイクアウト",
    rsi_threshold: "RSI 条件",
    macd: "MACD",
    bbands: "ボリンジャーバンド",
    stoch: "ストキャスティクス",
    adx_threshold: "ADX",
    cci_threshold: "CCI",
    vwap: "VWAP",
    supertrend: "スーパートレンド",
    donchian_breakout: "ドンチャン",
  },

  // ===== Exit =====
  timeStop: "タイムストップ（バー数）",
  takeProfit: "利確（R 倍）",
  initialSL: "初期ストップ（ATR 倍）",
  trailing: "トレーリング",

  // Trailing
  trailingBreakeven: "ブレイクイーブン",
  trailingATR: "ATR",

  breakevenOffset: "ブレイクイーブン補正（pips）",

  atrDetail: "ATR トレーリング詳細",
  atrLength: "ATR 期間",
  atrMultiplier: "ATR 倍率",
  atrMode: "モード",
  atrLookback: "ルックバック（chandelier 用）",

  chandelier: "シャンデリア",
  step: "ステップ",

  // Indicator Exit
  indicatorExit: "インジケーター決済（RSI）",
  indicatorExitNote: "RSI 30/70 + 50 ミッドライン",
  oppositeExit: "逆シグナル決済",
  oppositeExitNote: "次のバーで逆エントリーが出た場合に決済",

  // ===== Costs =====
  fee: "手数料（bps）",
  slippage: "スリッページ（bps）",

  // ===== Actions =====
  run: "実行",
  running: "実行中…",

  // ===== Status / Errors =====
  runId: "run_id",
  runFailed: "実行に失敗しました",
  unauthorized: "認証が必要です。ログインしてください。",

  // ===== Share =====
  share: "共有",
};