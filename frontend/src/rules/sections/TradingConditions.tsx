// rules/sections/TradingConditions.tsx
"use client";

import { useRuleStore } from "../store";

export function TradingConditions() {
  const { rule, setTradingCondition } = useRuleStore();

  const tc = rule.tradingConditions;

  return (
    <div className="space-y-4">
      <h3 className="font-bold">取引条件</h3>

      <div className="grid grid-cols-2 gap-4">
        <label>
          初期残高
          <input
            type="number"
            value={tc.initialBalance}
            onChange={(e) =>
              setTradingCondition("initialBalance", Number(e.target.value))
            }
          />
        </label>

        <label>
          スプレッド（pips）
          <input
            type="number"
            value={tc.spreadPips}
            onChange={(e) =>
              setTradingCondition("spreadPips", Number(e.target.value))
            }
          />
        </label>

        <label>
          スリッページ（pips）
          <input
            type="number"
            value={tc.slippagePips}
            onChange={(e) =>
              setTradingCondition("slippagePips", Number(e.target.value))
            }
          />
        </label>

        <label>
          手数料
          <input
            type="number"
            value={tc.commission}
            onChange={(e) =>
              setTradingCondition("commission", Number(e.target.value))
            }
          />
        </label>

        <label>
          レバレッジ
          <input
            type="number"
            value={tc.leverage}
            onChange={(e) =>
              setTradingCondition("leverage", Number(e.target.value))
            }
          />
        </label>

        <label>
          マージンコール水準（％）
          <input
            type="number"
            value={tc.marginCallLevel}
            onChange={(e) =>
              setTradingCondition("marginCallLevel", Number(e.target.value))
            }
          />
        </label>
      </div>

      <div>
        <label className="block font-medium">ロットモード</label>
        <label>
          <input
            type="radio"
            checked={tc.lotMode === "fixed"}
            onChange={() => setTradingCondition("lotMode", "fixed")}
          />
          固定
        </label>
        <label className="ml-4">
          <input
            type="radio"
            checked={tc.lotMode === "dynamic"}
            onChange={() => setTradingCondition("lotMode", "dynamic")}
          />
          可変
        </label>
      </div>
    </div>
  );
}
