// src/rules/store.ts
"use client";

import { create } from "zustand";
import type { EntryType } from "@/features/run/types";

type AnyParams = Record<string, any>;

type EntryState = {
  single: { type: EntryType; params: AnyParams };
  long:   { type: EntryType; params: AnyParams };
  short:  { type: EntryType; params: AnyParams };
};

/* ======================
   型定義
====================== */

export type Logic = "AND" | "OR";

export type RuleType =
  | "indicator"
  | "price"
  | "time"
  | "chartPattern"
  | "exit";

export type RuleItem = {
  id: string;
  type: RuleType;
  key: string;
    params?: Record<string, any>; 
  direction?: "long" | "short";
  operator?: string;
  value?: number | string;
};

export type RuleBlock = {
  enabled: boolean;
  logic: Logic;
  rules: RuleItem[];
};

export type TradingConditionsState = {
  balance: number | null;        // 初期残高
  spread: number | null;         // スプレッド（pips）
  slippage: number | null;       // スリッページ（pips）
  swap: number | null;           // スワップ（円/lot/日）
  commission: number | null;     // 手数料（円/lot 往復）

  leverage: number | null;       // 1:100 → 100 の数値
  marginCall: number | null;     // マージンコール水準 (%)

  lotMode: "fixed" | "dynamic";  // 固定 or 動的
  lotSize: number | null;        // 固定ロット時のロット数
  riskPct: number | null;        // 動的ロット時のリスク(%)

  /** 手数料 bps（trading 未指定時の API フォールバック用） */
  feeBps: number | null;
  /** スリッページ bps（trading 未指定時の API フォールバック用） */
  slipBps: number | null;
  /** 積み増し（ピラミッディング）：同一方向でシグナルが出るたびに追加エントリー */
  allowPyramid: boolean;
};

export type TimeZoneRule = {
  enabled: boolean;
  /** バックテスト期間（YYYY-MM-DD）。未設定時は全期間 */
  period: {
    start: string | null;
    end: string | null;
  };
  daysOfWeek: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    boolean
  >;
  intraday: {
    enabled: boolean;
    from: string;
    to: string;
  };
};

/** ロング/ショート別の TP/SL 等（エグジット数値） */
export type ExitSideState = {
  tpPips: number | null;
  slPips: number | null;
  tpPct: number | null;
  slPct: number | null;
  tpTimeMin: number | null;
  slTimeMin: number | null;
};

const defaultExitSide: ExitSideState = {
  tpPips: null,
  slPips: null,
  tpPct: null,
  slPct: null,
  tpTimeMin: null,
  slTimeMin: null,
};

export type ExitState = {
  enabled: boolean;
  logic: Logic;

  /** 従来の単一値（long/short 未設定時のフォールバック） */
  tpPips: number | null;
  slPips: number | null;

  /** ロング・ショート別（未設定時は上記 tpPips/slPips 等を使用） */
  long?: ExitSideState | null;
  short?: ExitSideState | null;

  candleRules: RuleItem[];

  tpPct: number | null;
  slPct: number | null;
  tpTimeMin: number | null;
  slTimeMin: number | null;

  forcedExit: {
    start: string | null;
    end: string | null;
  };

  trailing: {
    activate: number | null;
    trail: number | null;
  };
};


export type StrategyMeta = {
  pair: string;
  timeframe: string;
  direction: "long" | "short" | "both";
};

export type StrategyRule = {
  meta: StrategyMeta;

  tradingConditions: TradingConditionsState;

  indicatorThreshold: RuleBlock;
  timeZone: TimeZoneRule;
  priceAction: RuleBlock;
  chartPattern: RuleBlock;
  exit: ExitState;
};

/* ======================
   Store
====================== */

export type RuleStore = {
  rule: StrategyRule;

  /** 部分更新。オブジェクトのほか、(現在の rule) => Partial<StrategyRule) で最新状態を元にマージ可能 */
  update: (
    partialOrUpdater:
      | Partial<StrategyRule>
      | ((rule: StrategyRule) => Partial<StrategyRule>)
  ) => void;

  /** バックテスト期間の開始/終了のみ更新（他フィールドを確実に維持） */
  setTimeZonePeriod: (
    field: "start" | "end",
    value: string | null
  ) => void;
};


export const useRuleStore = create<RuleStore>((set) => ({
  rule: {
    meta: {
      pair: "EURUSD",
      timeframe: "H1",
      direction: "long",
    },

tradingConditions: {
  allowPyramid: false,
  balance: 100000,
  spread: 1.5,
  slippage: 0.5,
  swap: 0,
  commission: 7,
  leverage: 100,
  marginCall: 100,
  lotMode: "fixed",
  lotSize: 0.1,
  riskPct: 1,
  feeBps: 5,
  slipBps: 0.5,
},


    indicatorThreshold: {
      enabled: false,
      logic: "OR",
      rules: [],
    },

    timeZone: {
      enabled: false,
      period: { start: null, end: null },
      daysOfWeek: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
      intraday: {
        enabled: false,
        from: "",
        to: "",
      },
    },

    priceAction: {
      enabled: false,
      logic: "AND",
      rules: [],
    },

    chartPattern: {
      enabled: false,
      logic: "AND",
      rules: [],
    },

exit: {
  enabled: false,
  logic: "AND",

  tpPips: null,
  slPips: null,
  long: { ...defaultExitSide },
  short: { ...defaultExitSide },
  candleRules: [],

  tpPct: null,
  slPct: null,

  tpTimeMin: null,
  slTimeMin: null,

  forcedExit: {
    start: null,
    end: null,
  },

  trailing: {
    activate: null,
    trail: null,
  },
},

  },

  update: (partialOrUpdater) =>
    set((state) => ({
      rule: {
        ...state.rule,
        ...(typeof partialOrUpdater === "function"
          ? partialOrUpdater(state.rule)
          : partialOrUpdater),
      },
    })),

  setTimeZonePeriod: (field, value) =>
    set((state) => {
      const tz = state.rule.timeZone;
      const period = tz.period ?? { start: null, end: null };
      return {
        rule: {
          ...state.rule,
          timeZone: {
            ...tz,
            period: { ...period, [field]: value },
          },
        },
      };
    }),
}));
