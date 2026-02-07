// rules/sections/IndicatorThreshold.tsx
"use client";

import { useRuleStore } from "../store";
import { RuleRow } from "../RuleRow";

export function IndicatorThreshold() {
  const {
    rule,
    toggleIndicator,
    setIndicatorLogic,
    addIndicatorRule,
    updateIndicatorRule,
    removeIndicatorRule,
  } = useRuleStore();

  if (!rule.indicatorThreshold.enabled) {
    return (
      <label>
        <input
          type="checkbox"
          checked={false}
          onChange={(e) => toggleIndicator(e.target.checked)}
        />
        インジケーター条件
      </label>
    );
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked
          onChange={(e) => toggleIndicator(e.target.checked)}
        />
        インジケーター条件
      </label>

      <select
        value={rule.indicatorThreshold.logic}
        onChange={(e) => setIndicatorLogic(e.target.value as any)}
      >
        <option value="AND">AND（すべて満たす）</option>
        <option value="OR">OR（いずれかを満たす）</option>
      </select>

      {rule.indicatorThreshold.rules.map((r) => (
        <RuleRow
          key={r.id}
          rule={r}
          onChange={(patch) => updateIndicatorRule(r.id, patch)}
          onDelete={() => removeIndicatorRule(r.id)}
        />
      ))}

      <button onClick={addIndicatorRule}>＋条件追加</button>
    </div>
  );
}
