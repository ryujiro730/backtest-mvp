// rules/sections/PriceActionSection.tsx
"use client";

import { useRuleStore } from "../store";
import { RuleRow } from "../RuleRow";

export function PriceActionSection() {
  const {
    rule,
    togglePriceAction,
    setPriceActionLogic,
    addPriceAction,
  } = useRuleStore();

  const pa = rule.priceAction;

  return (
    <div className="space-y-4">
      <h3 className="font-bold">プライスアクション</h3>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={pa.enabled}
          onChange={(e) => togglePriceAction(e.target.checked)}
        />
        プライスアクションを有効化
      </label>

      {pa.enabled && (
        <>
          {/* AND / OR */}
          <div className="flex gap-4 items-center">
            <span>判定ロジック:</span>
            <select
              value={pa.logic}
              onChange={(e) =>
                setPriceActionLogic(e.target.value as "AND" | "OR")
              }
            >
              <option value="AND">AND（すべて満たす）</option>
              <option value="OR">OR（いずれかを満たす）</option>
            </select>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            {pa.patterns.map((r) => (
              <RuleRow key={r.id} rule={r} />
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded-lg"
            onClick={addPriceAction}
          >
            ＋ パターンを追加
          </button>
        </>
      )}
    </div>
  );
}
