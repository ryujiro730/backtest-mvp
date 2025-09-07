export type Direction = "long" | "short";
export type EntryType = "ema_cross" | "breakout" | "rsi_threshold";
export type RsiEvent = "cross_up" | "cross_down";
export type EquityPoint = { t: number; e: number };
export type Catalog = { pairs: string[]; timeframes: string[]; items: {pair:string; timeframe:string; dataset_hash:string}[] };

