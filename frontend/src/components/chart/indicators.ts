import type { CandlestickBar } from "./ChartArea";

export type IndicatorId = string;

/** 価格軸に重ねるか、下部オシレーターゾーンに表示するか */
export type IndicatorScale = "price" | "oscillator";

export type IndicatorDef = {
  id: IndicatorId;
  name: string;
  /** ダイアログ表示用（未指定なら name(period)） */
  label?: string;
  /** 価格軸に重ねる(price) or 下部ゾーン(oscillator) */
  scale: IndicatorScale;
  type:
    | "SMA"
    | "EMA"
    | "WMA"
    | "RSI"
    | "BB_UPPER"
    | "BB_MIDDLE"
    | "BB_LOWER"
    | "MACD"
    | "MACD_SIGNAL"
    | "STOCH_K"
    | "STOCH_D"
    | "ATR";
  period: number;
  period2?: number;
  period3?: number;
  /** Bollinger Bands の乗数（標準偏差の倍率） */
  mult?: number;
  color: string;
};

/** ユーザーが編集するインジケータパラメータ */
export type IndicatorParams = {
  enabled: boolean;
  period: number;
  period2?: number;
  period3?: number;
  mult?: number;
};

/** def のデフォルトから params を生成 */
export function getDefaultParams(def: IndicatorDef): IndicatorParams {
  return {
    enabled: false,
    period: def.period,
    period2: def.period2,
    period3: def.period3,
    mult: def.mult,
  };
}

/** def + params をマージして computeIndicator に渡す IndicatorDef を返す */
export function getDefWithParams(def: IndicatorDef, params: IndicatorParams): IndicatorDef {
  return {
    ...def,
    period: params.period,
    period2: params.period2,
    period3: params.period3,
    mult: params.mult,
  };
}

/** 選択可能なインジケータ一覧（内部計算用・1タイプ複数 def あり） */
export const AVAILABLE_INDICATORS: IndicatorDef[] = [
  { id: "sma-20", name: "SMA", scale: "price", type: "SMA", period: 20, color: "#6366f1" },
  { id: "sma-50", name: "SMA", scale: "price", type: "SMA", period: 50, color: "#8b5cf6" },
  { id: "sma-200", name: "SMA", scale: "price", type: "SMA", period: 200, color: "#a855f7" },
  { id: "ema-9", name: "EMA", scale: "price", type: "EMA", period: 9, color: "#f59e0b" },
  { id: "ema-12", name: "EMA", scale: "price", type: "EMA", period: 12, color: "#0ea5e9" },
  { id: "ema-26", name: "EMA", scale: "price", type: "EMA", period: 26, color: "#06b6d4" },
  { id: "ema-50", name: "EMA", scale: "price", type: "EMA", period: 50, color: "#14b8a6" },
  { id: "wma-20", name: "WMA", scale: "price", type: "WMA", period: 20, color: "#f97316" },
  { id: "rsi-14", name: "RSI", scale: "oscillator", type: "RSI", period: 14, color: "#ec4899" },
  { id: "rsi-7", name: "RSI", scale: "oscillator", type: "RSI", period: 7, color: "#db2777" },
  { id: "bb-upper-20-2", name: "BB Upper", scale: "price", type: "BB_UPPER", period: 20, mult: 2, color: "#22c55e" },
  { id: "bb-middle-20-2", name: "BB Middle", scale: "price", type: "BB_MIDDLE", period: 20, mult: 2, color: "#16a34a" },
  { id: "bb-lower-20-2", name: "BB Lower", scale: "price", type: "BB_LOWER", period: 20, mult: 2, color: "#22c55e" },
  { id: "macd-12-26-9", name: "MACD", scale: "price", type: "MACD", period: 12, period2: 26, period3: 9, color: "#3b82f6" },
  { id: "macd-signal-12-26-9", name: "MACD Signal", scale: "price", type: "MACD_SIGNAL", period: 12, period2: 26, period3: 9, color: "#ef4444" },
  { id: "stoch-k-14-3-3", name: "Stoch %K", scale: "oscillator", type: "STOCH_K", period: 14, period2: 3, period3: 3, color: "#8b5cf6" },
  { id: "stoch-d-14-3-3", name: "Stoch %D", scale: "oscillator", type: "STOCH_D", period: 14, period2: 3, period3: 3, color: "#6366f1" },
  { id: "atr-14", name: "ATR", scale: "price", type: "ATR", period: 14, color: "#64748b" },
  { id: "atr-7", name: "ATR", scale: "price", type: "ATR", period: 7, color: "#94a3b8" },
];

/** ユニークなインジケータ種別（Indicators タブでリスト表示・クリックでデフォルト設定で追加） */
export type UniqueIndicatorType = { id: string; name: string; defIds: string[] };

export const UNIQUE_INDICATOR_TYPES: UniqueIndicatorType[] = [
  { id: "SMA", name: "SMA", defIds: ["sma-20"] },
  { id: "EMA", name: "EMA", defIds: ["ema-9"] },
  { id: "WMA", name: "WMA", defIds: ["wma-20"] },
  { id: "RSI", name: "RSI", defIds: ["rsi-14"] },
  { id: "BB", name: "Bollinger Bands", defIds: ["bb-upper-20-2", "bb-middle-20-2", "bb-lower-20-2"] },
  { id: "MACD", name: "MACD", defIds: ["macd-12-26-9", "macd-signal-12-26-9"] },
  { id: "Stoch", name: "Stochastic", defIds: ["stoch-k-14-3-3", "stoch-d-14-3-3"] },
  { id: "ATR", name: "ATR", defIds: ["atr-14"] },
];

export function getDefById(defId: string): IndicatorDef | undefined {
  return AVAILABLE_INDICATORS.find((d) => d.id === defId);
}

/** タイプのデフォルトパラメータ（リストから追加するときの初期値） */
export function getDefaultParamsForTypeId(typeId: string): IndicatorParams {
  const t = UNIQUE_INDICATOR_TYPES.find((x) => x.id === typeId);
  const def = t ? getDefById(t.defIds[0]) : undefined;
  if (!def) return { enabled: true, period: 14, period2: undefined, period3: undefined, mult: undefined };
  return { ...getDefaultParams(def), enabled: true };
}

export type IndicatorPoint = { time: number; value: number };

export function computeSMA(
  bars: CandlestickBar[],
  period: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += bars[i - j].close;
    result.push({ time: bars[i].time, value: sum / period });
  }
  return result;
}

export function computeEMA(
  bars: CandlestickBar[],
  period: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const k = 2 / (period + 1);
  if (bars.length === 0) return result;
  let ema = bars[0].close;
  result.push({ time: bars[0].time, value: ema });
  for (let i = 1; i < bars.length; i++) {
    ema = bars[i].close * k + ema * (1 - k);
    result.push({ time: bars[i].time, value: ema });
  }
  return result;
}

/** EMA を値の配列に対して計算（MACD のシグナル用） */
function emaFromValues(values: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  if (values.length === 0) return result;
  let ema = values[0];
  result.push(ema);
  for (let i = 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

export function computeWMA(
  bars: CandlestickBar[],
  period: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const weightSum = (period * (period + 1)) / 2;
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += bars[i - j].close * (period - j);
    result.push({ time: bars[i].time, value: sum / weightSum });
  }
  return result;
}

/** RSI (Wilder's smoothing) */
export function computeRSI(
  bars: CandlestickBar[],
  period: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (bars.length < period + 1) return result;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    if (diff > 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period; i < bars.length; i++) {
    if (i > period) {
      const diff = bars[i].close - bars[i - 1].close;
      avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    result.push({ time: bars[i].time, value: rsi });
  }
  return result;
}

/** 期間内の標準偏差 */
function stdDev(bars: CandlestickBar[], startIdx: number, period: number): number {
  let sum = 0;
  for (let j = 0; j < period; j++) sum += bars[startIdx - j].close;
  const mean = sum / period;
  let sq = 0;
  for (let j = 0; j < period; j++) {
    const d = bars[startIdx - j].close - mean;
    sq += d * d;
  }
  return Math.sqrt(sq / period);
}

export function computeBBMiddle(bars: CandlestickBar[], period: number): IndicatorPoint[] {
  return computeSMA(bars, period);
}

export function computeBBUpper(
  bars: CandlestickBar[],
  period: number,
  mult: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += bars[i - j].close;
    const mid = sum / period;
    const sd = stdDev(bars, i, period);
    result.push({ time: bars[i].time, value: mid + mult * sd });
  }
  return result;
}

export function computeBBLower(
  bars: CandlestickBar[],
  period: number,
  mult: number
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += bars[i - j].close;
    const mid = sum / period;
    const sd = stdDev(bars, i, period);
    result.push({ time: bars[i].time, value: mid - mult * sd });
  }
  return result;
}

/** MACD 線 = EMA(close, fast) - EMA(close, slow) */
export function computeMACDLine(
  bars: CandlestickBar[],
  fast: number,
  slow: number
): IndicatorPoint[] {
  const emaFast = computeEMA(bars, fast);
  const emaSlow = computeEMA(bars, slow);
  const result: IndicatorPoint[] = [];
  for (let i = 0; i < bars.length; i++) {
    result.push({
      time: bars[i].time,
      value: emaFast[i].value - emaSlow[i].value,
    });
  }
  return result;
}

/** MACD シグナル = EMA(MACD line, signalPeriod) */
export function computeMACDSignal(
  bars: CandlestickBar[],
  fast: number,
  slow: number,
  signalPeriod: number
): IndicatorPoint[] {
  const macdPoints = computeMACDLine(bars, fast, slow);
  if (macdPoints.length === 0) return [];
  const values = macdPoints.map((p) => p.value);
  const emaSignal = emaFromValues(values, signalPeriod);
  return macdPoints.map((p, i) => ({ time: p.time, value: emaSignal[i] }));
}

/** Stochastic %K (raw). smoothK は後で SMA をかける */
function stochRawK(bars: CandlestickBar[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let high = bars[i].high;
    let low = bars[i].low;
    for (let j = 1; j < period; j++) {
      high = Math.max(high, bars[i - j].high);
      low = Math.min(low, bars[i - j].low);
    }
    const range = high - low;
    const value = range === 0 ? 50 : ((bars[i].close - low) / range) * 100;
    result.push({ time: bars[i].time, value });
  }
  return result;
}

/** %K に SMA(smoothK) をかけたもの */
export function computeStochK(
  bars: CandlestickBar[],
  period: number,
  smoothK: number
): IndicatorPoint[] {
  const raw = stochRawK(bars, period);
  const result: IndicatorPoint[] = [];
  for (let i = smoothK - 1; i < raw.length; i++) {
    let sum = 0;
    for (let j = 0; j < smoothK; j++) sum += raw[i - j].value;
    result.push({ time: raw[i].time, value: sum / smoothK });
  }
  return result;
}

/** %D = SMA(%K, smoothD) */
export function computeStochD(
  bars: CandlestickBar[],
  period: number,
  smoothK: number,
  smoothD: number
): IndicatorPoint[] {
  const kPoints = computeStochK(bars, period, smoothK);
  const result: IndicatorPoint[] = [];
  for (let i = smoothD - 1; i < kPoints.length; i++) {
    let sum = 0;
    for (let j = 0; j < smoothD; j++) sum += kPoints[i - j].value;
    result.push({ time: kPoints[i].time, value: sum / smoothD });
  }
  return result;
}

/** True Range → Wilder's smoothing で ATR */
export function computeATR(bars: CandlestickBar[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (bars.length < 2) return result;
  const trValues: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    );
    trValues.push(tr);
  }
  if (trValues.length < period) return result;
  let atr = trValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push({ time: bars[period].time, value: atr });
  for (let i = period; i < trValues.length; i++) {
    atr = (atr * (period - 1) + trValues[i]) / period;
    result.push({ time: bars[i + 1].time, value: atr });
  }
  return result;
}

export function computeIndicator(
  bars: CandlestickBar[],
  def: IndicatorDef
): IndicatorPoint[] {
  switch (def.type) {
    case "SMA":
      return computeSMA(bars, def.period);
    case "EMA":
      return computeEMA(bars, def.period);
    case "WMA":
      return computeWMA(bars, def.period);
    case "RSI":
      return computeRSI(bars, def.period);
    case "BB_UPPER":
      return computeBBUpper(bars, def.period, def.mult ?? 2);
    case "BB_MIDDLE":
      return computeBBMiddle(bars, def.period);
    case "BB_LOWER":
      return computeBBLower(bars, def.period, def.mult ?? 2);
    case "MACD":
      return computeMACDLine(bars, def.period, def.period2 ?? 26);
    case "MACD_SIGNAL":
      return computeMACDSignal(
        bars,
        def.period,
        def.period2 ?? 26,
        def.period3 ?? 9
      );
    case "STOCH_K":
      return computeStochK(bars, def.period, def.period2 ?? 3);
    case "STOCH_D":
      return computeStochD(
        bars,
        def.period,
        def.period2 ?? 3,
        def.period3 ?? 3
      );
    case "ATR":
      return computeATR(bars, def.period);
    default:
      return [];
  }
}
