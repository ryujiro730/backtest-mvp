// defaults.ts
export const DEFAULT_PARAMS: Record<EntryType, any> = {
  ema_cross: { emaFast: 12, emaSlow: 26, emaCross: "above" as const },
  breakout:  { lookback: 20, side: "high" },
  rsi_threshold: { length: 14, level: 50, event: "cross_up" },
  macd: { fast: 12, slow: 26, signal: 9, event: "cross_up" },
  bbands: { length: 20, mult: 2, event: "cross_below_lower" },
  stoch: { k: 14, d: 3, smooth: 1, overbought: 80, oversold: 20, event: "k_over_d_cross_up" },
  adx_threshold: { length: 14, level: 20, event: "adx_gt" },
  cci_threshold: { length: 20, level: 100, event: "cross_down" },
  vwap: { event: "price_cross_above" },
  supertrend: { length: 10, multiplier: 3, event: "trend_up" },
  donchian_breakout: { lookback: 20, side: "high" },
};
