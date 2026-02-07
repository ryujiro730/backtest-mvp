// rules/sections/ExitSection.tsx
"use client";

import { useRuleStore } from "../store";
import { RuleRow } from "../RuleRow";

export function ExitSection() {
  const {
    rule,
    toggleExit,
    setExitLogic,
    addExitRule,
  } = useRuleStore();

  const exit = rule.exit;

  return (
    <div className="space-y-4">
      <h3 className="font-bold">エグジット</h3>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={exit.enabled}
          onChange={(e) => toggleExit(e.target.checked)}
        />
        エグジットルールを有効化
      </label>

      {exit.enabled && (
        <>
          <div className="flex gap-4 items-center">
            <span>判定ロジック:</span>
            <select
              value={exit.logic}
              onChange={(e) =>
                setExitLogic(e.target.value as "AND" | "OR")
              }
            >
              <option value="AND">AND（すべて満たす）</option>
              <option value="OR">OR（いずれかを満たす）</option>
            </select>
          </div>

          <div className="space-y-2">
            {exit.rules.map((r) => (
              <RuleRow key={r.id} block="exit" rule={r} />
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded-lg"
            onClick={addExitRule}
          >
            ＋ エグジットルールを追加
          </button>
        </>
      )}
    </div>
  );
}
