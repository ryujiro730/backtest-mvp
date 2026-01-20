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
      meta.direction === "both" ? r.direction : "single",
      meta.direction
    )
  );
}

function buildEntriesFromTimeZone(rule: StrategyRule) {
  const { timeZone, meta } = rule;

  if (!timeZone.enabled) return [];

  return [
    buildEntry(
      "time_window",
      {
        days: timeZone.daysOfWeek,
        intraday: timeZone.intraday,
      },
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
   Exit Section（新 UI 対応）
=========================================== */

function buildExitSection(rule: StrategyRule) {
  const exit = rule.exit;

  // exit disabled
  if (!exit.enabled) return {};

  const out: any = {};

  /* --- TP / SL pips → API --- */
  if (exit.tpPips != null && exit.slPips != null && exit.slPips > 0) {
    // tp_r_multiple = TP(pips) / SL(pips)
    out.tp_r_multiple = exit.tpPips / exit.slPips;
    out.sl_fixed_pips = exit.slPips;
  }

  /* --- % based exit --- */
  if (exit.tpPct != null) out.tp_pct = exit.tpPct;
  if (exit.slPct != null) out.sl_pct = exit.slPct;

/* --- Time based Exit (minutes → bars) --- */
const tfMin = timeframeToMinutes(rule.meta.timeframe);

if (exit.tpTimeMin != null) {
  out.tp_time_stop_bars = Math.round(exit.tpTimeMin / tfMin);
}

if (exit.slTimeMin != null) {
  out.sl_time_stop_bars = Math.round(exit.slTimeMin / tfMin);
}

/* --- Time based Exit (minutes, worker用) --- */
if (exit.tpTimeMin != null) {
  out.max_hold_minutes_profit = exit.tpTimeMin;
} else if (exit.slTimeMin != null) {
  out.max_hold_minutes_profit = exit.slTimeMin;
}


  /* --- Forced exit window --- */
  if (exit.forcedExit.start || exit.forcedExit.end) {
    out.forced_exit = {
      start: exit.forcedExit.start ?? null,
      end: exit.forcedExit.end ?? null,
    };
  }

  /* --- Candle exit --- */
  if (exit.candleRules.length > 0) {
    out.candle_exit = exit.candleRules.map((r) => ({
      pattern: r.key,
      signal: r.params.signal,
      entrySide: r.params.entrySide,
    }));
  }

  /* --- Trailing pips --- */
  if (
    exit.trailing.activate != null &&
    exit.trailing.trail != null
  ) {
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
  tradingConditions.feeBps !== "" &&
  tradingConditions.feeBps !== null &&
  tradingConditions.feeBps !== undefined
    ? Number(tradingConditions.feeBps)
    : undefined,

slippage_bps:
  tradingConditions.slipBps !== "" &&
  tradingConditions.slipBps !== null &&
  tradingConditions.slipBps !== undefined
    ? Number(tradingConditions.slipBps)
    : undefined,


    entry: [] as any[],
    exit: {} as any,
  };
    // --- Trading Conditions ---
base.trading = {
  balance: rule.tradingConditions.balance ?? undefined,
  spread:  rule.tradingConditions.spread ?? undefined,
  slippage: rule.tradingConditions.slippage ?? undefined,
  swap: rule.tradingConditions.swap ?? undefined,
  commission: rule.tradingConditions.commission ?? undefined,

  leverage: rule.tradingConditions.leverage ?? undefined,
  margin_call: rule.tradingConditions.marginCall ?? undefined,

  lot_mode: rule.tradingConditions.lotMode ?? "fixed",
  lot_size: rule.tradingConditions.lotSize ?? undefined,
  risk_pct: rule.tradingConditions.riskPct ?? undefined,
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
  ];

  if (allEntries.length > 0) {
    base.entry = allEntries
      .filter(Boolean)
      .map((e) => ({
        ...e,
        side: normalizeSide(e.side, meta.direction),
      }));
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
