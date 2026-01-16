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
  swap: number | null;           // スワップ（金額）
  commission: number | null;     // 手数料（円/lot）

  leverage: number | null;       // 1:100 → 100 の数値
  marginCall: number | null;     // マージンコール水準 (%)

  lotMode: "fixed" | "dynamic";  // 固定 or 動的
  lotSize: number | null;        // 固定ロット時のロット数
  riskPct: number | null;        // 動的ロット時のリスク(%)
};

export type TimeZoneRule = {
  enabled: boolean;
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

export type ExitState = {
  enabled: boolean;
  logic: Logic;

  tpPips: number | null;
  slPips: number | null;

  candleRules: RuleItem[]; // id,key,params 形式

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

  /** 部分更新用（これを UI から叩く） */
  update: (partial: Partial<StrategyRule>) => void;
};


export const useRuleStore = create<RuleStore>((set) => ({
  rule: {
    meta: {
      pair: "EURUSD",
      timeframe: "H1",
      direction: "long",
    },

tradingConditions: {
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
},


    indicatorThreshold: {
      enabled: false,
      logic: "OR",
      rules: [],
    },

    timeZone: {
      enabled: false,
      daysOfWeek: {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false,
      },
      intraday: {
        enabled: false,
        from: "09:00",
        to: "17:00",
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

  update: (partial) =>
    set((state) => ({
      rule: {
        ...state.rule,
        ...partial,
      },
    })),
}));
