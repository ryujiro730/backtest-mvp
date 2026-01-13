// src/features/run/types.ts

// ===== existing =====
export type Direction = "long" | "short" | "both";
export type RsiEvent = "cross_up" | "cross_down";
export type EquityPoint = { t: number; e: number };
export type Catalog = {
  pairs: string[];
  timeframes: string[];
  items: { pair: string; timeframe: string; dataset_hash: string }[];
};

// ===== new: events for added indicators =====
export type MacdEvent = "cross_up" | "cross_down" | "above_zero" | "below_zero";
export type BBandsEvent =
  | "cross_above_upper"
  | "cross_below_lower"
  | "cross_above_middle"
  | "cross_below_middle"
  | "touch_upper"
  | "touch_lower";
export type StochEvent =
  | "k_over_d_cross_up"
  | "k_over_d_cross_down"
  | "overbought_cross_down"
  | "oversold_cross_up";
export type AdxEvent = "adx_gt" | "adx_lt";
export type CciEvent = "cross_up" | "cross_down";
export type VwapEvent = "price_cross_above" | "price_cross_below";
export type SupertrendEvent = "trend_up" | "trend_down";

// ===== entries (discriminated union) =====
export type Entry =
  | { type: "ema_cross"; fast: number; slow: number; cross: "above" | "below" }
  | { type: "sma_cross"; short: number; long: number }
  | { type: "rsi_threshold"; length: number; level: number; event: RsiEvent }
  | { type: "breakout"; lookback: number; side: "high" | "low" }
  | { type: "macd"; fast: number; slow: number; signal: number; event: MacdEvent }
  | {
      type: "bbands";
      length: number;
      mult: number;
      event: BBandsEvent;
    }
  | {
      type: "stoch";
      k: number;
      d: number;
      smooth: number;
      overbought: number;
      oversold: number;
      event: StochEvent;
    }
  | { type: "adx_threshold"; length: number; level: number; event: AdxEvent }
  | { type: "cci_threshold"; length: number; level: number; event: CciEvent }
  | { type: "vwap"; event: VwapEvent }
  | {
      type: "supertrend";
      length: number;
      multiplier: number;
      event: SupertrendEvent;
    }
  | { type: "donchian_breakout"; lookback: number; side: "high" | "low" };

// 既存の EntryType を“自動で”広げる（既存コードとの互換性確保）
export type EntryType = Entry["type"];

// （任意）バックエンドの StrategyMvp0 に揃えたペイロード型
export type StrategyPayload = {
  pair: string;
  timeframe: string;
  direction: Direction;
  entry: Entry[];              // ← 複数条件を AND で組める
  exit?: Record<string, any>;  // MVP: サーバ側で解釈
  fee_bps?: number;
  slippage_bps?: number;
  date_range?: Record<string, any>;
};
