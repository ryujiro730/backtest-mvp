// src/lib/strategy/presets.ts
// プリセット戦略の定義（SimpleMode と PresetStrategies で共有）

import { nanoid } from "nanoid";
import type { StrategyRule } from "@/rules/store";

export type PresetKey = "goldenCross" | "rsiContrarian" | "breakout";

export function makeGoldenCross(): Partial<StrategyRule> {
  return {
    meta: {
      pair: "EURUSD",
      timeframe: "H1",
      direction: "both",
    },
    indicatorThreshold: {
      enabled: true,
      logic: "OR",
      rules: [
        {
          id: nanoid(),
          indicator: "ema",
          direction: "long",
          params: { fast: 25, slow: 75, cross: "above" },
        } as any,
        {
          id: nanoid(),
          indicator: "ema",
          direction: "short",
          params: { fast: 25, slow: 75, cross: "below" },
        } as any,
      ],
    },
    exit: {
      enabled: true,
      logic: "OR",
      tpPips: null,
      slPips: null,
      long: { tpPips: 50, slPips: 25, tpPct: null, slPct: null, tpTimeMin: null, slTimeMin: null },
      short: { tpPips: 50, slPips: 25, tpPct: null, slPct: null, tpTimeMin: null, slTimeMin: null },
      candleRules: [],
      tpPct: null,
      slPct: null,
      tpTimeMin: null,
      slTimeMin: null,
      forcedExit: { start: null, end: null },
      trailing: { activate: null, trail: null },
    },
    priceAction: { enabled: false, logic: "AND", rules: [] },
    chartPattern: { enabled: false, logic: "AND", rules: [] },
    timeZone: {
      enabled: false,
      period: { start: null, end: null },
      daysOfWeek: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      intraday: { enabled: false, from: "", to: "" },
    },
  };
}

export function makeRsiContrarian(): Partial<StrategyRule> {
  return {
    meta: {
      pair: "EURUSD",
      timeframe: "H1",
      direction: "both",
    },
    indicatorThreshold: {
      enabled: true,
      logic: "OR",
      rules: [
        {
          id: nanoid(),
          indicator: "rsi",
          direction: "long",
          params: { length: 14, level: 30, event: "cross_up" },
        } as any,
        {
          id: nanoid(),
          indicator: "rsi",
          direction: "short",
          params: { length: 14, level: 70, event: "cross_down" },
        } as any,
      ],
    },
    exit: {
      enabled: true,
      logic: "OR",
      tpPips: null,
      slPips: null,
      long: { tpPips: 30, slPips: 15, tpPct: null, slPct: null, tpTimeMin: null, slTimeMin: null },
      short: { tpPips: 30, slPips: 15, tpPct: null, slPct: null, tpTimeMin: null, slTimeMin: null },
      candleRules: [],
      tpPct: null,
      slPct: null,
      tpTimeMin: null,
      slTimeMin: null,
      forcedExit: { start: null, end: null },
      trailing: { activate: null, trail: null },
    },
    priceAction: { enabled: false, logic: "AND", rules: [] },
    chartPattern: { enabled: false, logic: "AND", rules: [] },
    timeZone: {
      enabled: false,
      period: { start: null, end: null },
      daysOfWeek: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      intraday: { enabled: false, from: "", to: "" },
    },
  };
}

export function makeBreakout(): Partial<StrategyRule> {
  return {
    meta: {
      pair: "EURUSD",
      timeframe: "H1",
      direction: "both",
    },
    indicatorThreshold: {
      enabled: true,
      logic: "OR",
      rules: [
        {
          id: nanoid(),
          indicator: "breakout",
          direction: "long",
          params: { lookback: 20, side: "high" },
        } as any,
        {
          id: nanoid(),
          indicator: "breakout",
          direction: "short",
          params: { lookback: 20, side: "low" },
        } as any,
      ],
    },
    exit: {
      enabled: true,
      logic: "OR",
      tpPips: null,
      slPips: null,
      long: { tpPips: 50, slPips: 20, tpPct: null, slPct: null, tpTimeMin: null, slTimeMin: null },
      short: { tpPips: 50, slPips: 20, tpPct: null, slPct: null, tpTimeMin: null, slTimeMin: null },
      candleRules: [],
      tpPct: null,
      slPct: null,
      tpTimeMin: null,
      slTimeMin: null,
      forcedExit: { start: null, end: null },
      trailing: { activate: null, trail: null },
    },
    priceAction: { enabled: false, logic: "AND", rules: [] },
    chartPattern: { enabled: false, logic: "AND", rules: [] },
    timeZone: {
      enabled: false,
      period: { start: null, end: null },
      daysOfWeek: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      intraday: { enabled: false, from: "", to: "" },
    },
  };
}

export const PRESETS: { key: PresetKey; make: () => Partial<StrategyRule> }[] = [
  { key: "goldenCross",   make: makeGoldenCross },
  { key: "rsiContrarian", make: makeRsiContrarian },
  { key: "breakout",      make: makeBreakout },
];
