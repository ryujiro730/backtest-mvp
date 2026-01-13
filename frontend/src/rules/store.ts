// rules/store.ts
"use client";

import { create } from "zustand";
import { v4 as uuid } from "uuid";

/* ======================
   型定義
====================== */

export type Logic = "AND" | "OR";

export type RuleType =
  | "indicator"
  | "price"
  | "time"
  | "exit";

export type RuleItem = {
  id: string;
  type: RuleType;
  key: string;     // rsi / ema / engulfing / bars など
  operator?: string;
  value?: number | string;
};

export type RuleBlock = {
  enabled: boolean;
  logic: Logic;
  rules: RuleItem[];
};

export type StrategyRule = {
  tradingConditions: {
    lotMode: "fixed" | "risk";
  };

  indicatorThreshold: RuleBlock;
  timeZone: RuleBlock;
  priceAction: RuleBlock;
  exit: RuleBlock;
};

/* ======================
   Store
====================== */

export type RuleStore = {
  rule: {
    tradingConditions: {
      lotMode: "fixed" | "dynamic";
    };

    indicatorThreshold: {
      enabled: boolean;
      logic: "AND" | "OR";
      rules: any[];
    };

    timeZone: {
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

    priceAction: {
      enabled: boolean;
      logic: "AND" | "OR";
      rules: any[];
    };

    exit: {
      enabled: boolean;
      logic: "AND" | "OR";
      rules: any[];
    };
  };

  updateRule: (partial: Partial<RuleStore["rule"]>) => void;
};


export const useRuleStore = create<RuleStore>((set) => ({
  rule: {
    tradingConditions: {
      lotMode: "fixed",
    },

    indicatorThreshold: {
      enabled: false,
      logic: "AND",
      rules: [],
    },

    timeZone: {
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

    exit: {
      enabled: false,
      logic: "OR",
      rules: [],
    },
  },

  updateRule: (partial) =>
    set((state) => ({
      rule: {
        ...state.rule,
        ...partial,
      },
    })),
}));