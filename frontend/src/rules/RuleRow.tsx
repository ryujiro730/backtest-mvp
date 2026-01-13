// rules/RuleRow.tsx
'use client'
import { RuleItem, useRuleStore } from "./store";

type Props = {
  block: keyof ReturnType<typeof useRuleStore>["rule"];
  rule: RuleItem;
};

export function RuleRow({ block, rule }: Props) {
  const { updateRule, removeRule } = useRuleStore();

  return (
    <div className="flex gap-2 items-center border rounded-xl p-2">
      <select
        value={rule.key}
        onChange={(e) =>
          updateRule(block, rule.id, { key: e.target.value })
        }
      >
        <option value="">条件</option>
        <option value="rsi">RSI</option>
        <option value="ema">EMA</option>
        <option value="bars">経過バー</option>
        <option value="opposite">逆シグナル</option>
      </select>

      {rule.key !== "opposite" && (
        <>
          <select
            value={rule.operator}
            onChange={(e) =>
              updateRule(block, rule.id, { operator: e.target.value })
            }
          >
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value="=">=</option>
          </select>

          <input
            className="border rounded px-2 py-1 w-24"
            value={rule.value ?? ""}
            onChange={(e) =>
              updateRule(block, rule.id, { value: e.target.value })
            }
          />
        </>
      )}

      <button
        className="ml-auto text-red-500"
        onClick={() => removeRule(block, rule.id)}
      >
        ✕
      </button>
    </div>
  );
}
