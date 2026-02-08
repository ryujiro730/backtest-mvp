// src/lib/strategy/buildPayload.ts

import { buildEntry } from "@/lib/strategy/buildEntry";
import type { Direction } from "@/features/run/types";
import type { StrategyRule } from "@/rules/store";

/* ===============================
   indicator → entry.type 対応
================================ */
function mapIndicatorToEntryType(ind: string) {
  switch (ind) {
    case "rsi":        return "rsi_threshold";
    case "sma":        return "sma_cross";
    case "ema":        return "ema_cross";
    case "macd":       return "macd";
    case "bbands":     return "bbands";
    case "stoch":      return "stoch";
    case "adx":        return "adx_threshold";
    case "cci":        return "cci_threshold";
    case "vwap":       return "vwap";
    case "supertrend": return "supertrend";
    case "donchian":   return "donchian_breakout";
    case "breakout":   return "breakout";
    default:
      throw new Error(`Unknown indicator: ${ind}`);
  }
}

/* ===============================
   IndicatorThreshold → entries
================================ */
function buildEntriesFromIndicators(rule: StrategyRule) {
  const { indicatorThreshold, meta } = rule;

  if (!indicatorThreshold.enabled) return [];

  return indicatorThreshold.rules.map((r: any) =>
    buildEntry(
      mapIndicatorToEntryType(r.indicator),
      { params: r.params },
      r.direction,
      "both"
    )
  );
}

function buildEntriesFromTimeZone(rule: StrategyRule) {
  const { timeZone, meta } = rule;

  if (!timeZone.enabled) return [];

  const period = timeZone.period;
  const params: Record<string, unknown> = {
    days: timeZone.daysOfWeek,
    intraday: timeZone.intraday,
  };
  if (period?.start) params.period_start = period.start;
  if (period?.end) params.period_end = period.end;

  return [
    buildEntry(
      "time_window",
      params,
      "single",
      meta.direction
    ),
  ];
}

function mapPriceActionToEntryType(key: string) {
  switch (key) {
    case "pinbar":      return "pinbar";
    case "engulfing":   return "engulfing";
    case "inside_bar":  return "inside_bar";
    case "three_bar":   return "three_bar_reversal";
    default:
      throw new Error(`Unknown price action: ${key}`);
  }
}

function buildEntriesFromPriceAction(rule: StrategyRule) {
  const { priceAction, meta } = rule;

  if (!priceAction.enabled) return [];

  return priceAction.rules.map((r: any) =>
    buildEntry(
      mapPriceActionToEntryType(r.key),
      { params: r.params },
      meta.direction === "both" ? r.direction : "single",
      meta.direction
    )
  );
}

function mapChartPatternToEntryType(key: string) {
  switch (key) {
    case "head_and_shoulders":  return "head_and_shoulders";
    case "ascending_triangle":  return "ascending_triangle";
    case "bear_flag":           return "bear_flag";
    default:
      throw new Error(`Unknown chart pattern: ${key}`);
  }
}

function buildEntriesFromChartPattern(rule: StrategyRule) {
  const { chartPattern, meta } = rule;

  if (!chartPattern.enabled) return [];

  return chartPattern.rules.map((r: any) =>
    buildEntry(
      mapChartPatternToEntryType(r.key),
      { params: r.params },
      meta.direction === "both" ? r.direction : "single",
      meta.direction
    )
  );
}

function normalizeSide(
  side: "long" | "short" | "single" | undefined,
  direction: Direction
): "long" | "short" | undefined {
  if (direction === "both") {
    return side === "single" ? undefined : side;
  }
  return direction; // long or short に強制
}

/* ===========================================
   Exit Section（ロング/ショート別対応）
=========================================== */

type ExitSidePayload = {
  tp_r_multiple?: number;
  sl_fixed_pips?: number;
  tp_pct?: number;
  sl_pct?: number;
  tp_time_stop_bars?: number;
  sl_time_stop_bars?: number;
};

function buildExitSidePayload(
  side: { tpPips: number | null; slPips: number | null; tpPct: number | null; slPct: number | null; tpTimeMin: number | null; slTimeMin: number | null },
  tfMin: number
): ExitSidePayload {
  const out: ExitSidePayload = {};
  if (side.tpPips != null && side.slPips != null && side.slPips > 0) {
    out.tp_r_multiple = side.tpPips / side.slPips;
    out.sl_fixed_pips = side.slPips;
  }
  if (side.tpPct != null) out.tp_pct = side.tpPct;
  if (side.slPct != null) out.sl_pct = side.slPct;
  if (side.tpTimeMin != null) out.tp_time_stop_bars = Math.round(side.tpTimeMin / tfMin);
  if (side.slTimeMin != null) out.sl_time_stop_bars = Math.round(side.slTimeMin / tfMin);
  return out;
}

function buildExitSection(rule: StrategyRule) {
  const exit = rule.exit;

  if (!exit.enabled) return {};

  const tfMin = timeframeToMinutes(rule.meta.timeframe);
  const fallbackSide = {
    tpPips: exit.tpPips,
    slPips: exit.slPips,
    tpPct: exit.tpPct,
    slPct: exit.slPct,
    tpTimeMin: exit.tpTimeMin,
    slTimeMin: exit.slTimeMin,
  };

  const longSide = exit.long ?? fallbackSide;
  const shortSide = exit.short ?? fallbackSide;

  const out: any = {
    long: buildExitSidePayload(longSide, tfMin),
    short: buildExitSidePayload(shortSide, tfMin),
  };

  if (exit.forcedExit.start || exit.forcedExit.end) {
    out.forced_exit = {
      start: exit.forcedExit.start ?? null,
      end: exit.forcedExit.end ?? null,
    };
  }
  if (exit.candleRules.length > 0) {
    out.candle_exit = exit.candleRules.map((r: any) => ({
      pattern: r.key,
      signal: r.params.signal,
      entrySide: r.params.entrySide,
    }));
  }
  if (exit.trailing.activate != null && exit.trailing.trail != null) {
    out.trail_pips = {
      activate: exit.trailing.activate,
      trail: exit.trailing.trail,
    };
  }

  return out;
}

/* convert timeframe string "H1" → minutes */
function timeframeToMinutes(tf: string): number {
  switch (tf) {
    case "M1":  return 1;
    case "M15": return 15;
    case "H1":  return 60;
    case "H4":  return 240;
    default:    return 1;
  }
}

/* ===============================
   main
================================ */
export function buildPayload(rule: StrategyRule) {
  const {
    meta,
    tradingConditions,
  } = rule;

  /* -------------------------------
     base
  -------------------------------- */
  const base: any = {
    pair: meta.pair,
    timeframe: meta.timeframe,
    direction: meta.direction,

fee_bps:
  typeof tradingConditions.feeBps === "number"
    ? tradingConditions.feeBps
    : 5,
slippage_bps:
  typeof tradingConditions.slipBps === "number"
    ? tradingConditions.slipBps
    : 0.5,


    entry: [] as any[],
    exit: {} as any,
  };
    // --- Trading Conditions（バックエンド engine の trading とキー整合） ---
base.trading = {
  balance: typeof rule.tradingConditions.balance === "number" ? rule.tradingConditions.balance : 100000,
  spread: typeof rule.tradingConditions.spread === "number" ? rule.tradingConditions.spread : 1.5,
  slippage: typeof rule.tradingConditions.slippage === "number" ? rule.tradingConditions.slippage : 0.5,
  swap: typeof rule.tradingConditions.swap === "number" ? rule.tradingConditions.swap : 0,
  commission: typeof rule.tradingConditions.commission === "number" ? rule.tradingConditions.commission : 7,
  leverage: typeof rule.tradingConditions.leverage === "number" ? rule.tradingConditions.leverage : 100,
  margin_call: typeof rule.tradingConditions.marginCall === "number" ? rule.tradingConditions.marginCall : 100,
  lot_mode: rule.tradingConditions.lotMode === "dynamic" ? "dynamic" : "fixed",
  lot_size: typeof rule.tradingConditions.lotSize === "number" && rule.tradingConditions.lotSize > 0
    ? rule.tradingConditions.lotSize
    : 0.1,
  risk_pct: typeof rule.tradingConditions.riskPct === "number" && rule.tradingConditions.riskPct > 0
    ? rule.tradingConditions.riskPct
    : 1,
  pyramid: Boolean(rule.tradingConditions.allowPyramid),
};



  /* -------------------------------
     entry（Indicator / Time / PriceAction / Pattern）
  -------------------------------- */
  const indicatorEntries    = buildEntriesFromIndicators(rule);
  const timeZoneEntries     = buildEntriesFromTimeZone(rule);
  const priceActionEntries  = buildEntriesFromPriceAction(rule);
  const chartPatternEntries = buildEntriesFromChartPattern(rule);

  const allEntries = [
    ...indicatorEntries,
    ...timeZoneEntries,
    ...priceActionEntries,
    ...chartPatternEntries,
  ].filter(Boolean);

  const hasLong = allEntries.some((e: any) => e.side === "long");
  const hasShort = allEntries.some((e: any) => e.side === "short");
  const effectiveDirection: Direction =
    hasLong && hasShort ? "both" : hasLong ? "long" : hasShort ? "short" : "long";

  base.direction = effectiveDirection;
  const normalizeEntry = (e: any) => ({
    ...e,
    side: normalizeSide(e.side, effectiveDirection),
  });

  if (allEntries.length > 0) {
    base.entry = allEntries.map(normalizeEntry);
    // AND/OR をバックエンドで反映するためブロック単位で送信
    const entry_blocks: { logic: "AND" | "OR"; entries: any[] }[] = [];
    if (indicatorEntries.length > 0) {
      entry_blocks.push({
        logic: rule.indicatorThreshold.logic,
        entries: indicatorEntries.map(normalizeEntry),
      });
    }
    if (timeZoneEntries.length > 0) {
      entry_blocks.push({ logic: "AND", entries: timeZoneEntries.map(normalizeEntry) });
    }
    if (priceActionEntries.length > 0) {
      entry_blocks.push({
        logic: rule.priceAction.logic,
        entries: priceActionEntries.map(normalizeEntry),
      });
    }
    if (chartPatternEntries.length > 0) {
      entry_blocks.push({
        logic: rule.chartPattern.logic,
        entries: chartPatternEntries.map(normalizeEntry),
      });
    }
    if (entry_blocks.length > 0) {
      base.entry_blocks = entry_blocks;
    }
  }

  /* -------------------------------
     exit（新UIに完全準拠）
  -------------------------------- */
  base.exit = buildExitSection(rule);

  console.log("=== DEBUG payload ===", JSON.stringify(base, null, 2));
  console.log("DEBUG rule.indicatorThreshold =", rule.indicatorThreshold);
  console.log("DEBUG rule.priceAction =", rule.priceAction);
  console.log("DEBUG rule.chartPattern =", rule.chartPattern);
  console.log("DEBUG rule.exit =", rule.exit);

  return base;
}
