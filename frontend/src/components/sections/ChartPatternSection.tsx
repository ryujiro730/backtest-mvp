"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogicSwitch } from "../common/LogicSwitch";
import { useRuleStore } from "../../rules/store";

/* =========================================================
   型
   ========================================================= */
type PatternDirection = "reversal" | "continuation";
type EntryDirection = "long" | "short";

/* =========================================================
   Chart Pattern Section
   ========================================================= */
export function ChartPatternSection() {
  const { rule, update } = useRuleStore();
  const cp = rule.chartPattern;

  const updateRules = (rules: any[]) =>
    update({
      chartPattern: {
        ...cp,
        rules,
      },
    });

  const updateRuleItem = (key: string, patch: any) =>
    updateRules(
      cp.rules.map((r: any) => (r.key === key ? { ...r, ...patch } : r))
    );

  const addPattern = (key: string, params: any) =>
    updateRules([
      ...cp.rules,
      {
        id: crypto.randomUUID(),
        type: "chartPattern",
        key,
        params,
      },
    ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>チャートパターン</CardTitle>

        <LogicSwitch
          value={cp.logic}
          onChange={(logic) =>
            update({
              chartPattern: {
                ...cp,
                logic,
              },
            })
          }
        />
      </CardHeader>

      <CardContent className="space-y-6">
        <PatternRow
          label="ヘッド＆ショルダー"
          patternKey="head_and_shoulders"
          onChange={(values) =>
            updateRuleItem("head_and_shoulders", values)
          }
          onAdd={() =>
            addPattern("head_and_shoulders", {
              direction: "reversal",
              entry: "long",
              option: "neckline",
            })
          }
        />

        <PatternRow
          label="アセンディングトライアングル"
          patternKey="ascending_triangle"
          onChange={(values) =>
            updateRuleItem("ascending_triangle", values)
          }
          onAdd={() =>
            addPattern("ascending_triangle", {
              direction: "reversal",
              entry: "long",
              option: "none",
            })
          }
        />

        <PatternRow
          label="ベアフラッグ"
          patternKey="bear_flag"
          onChange={(values) =>
            updateRuleItem("bear_flag", values)
          }
          onAdd={() =>
            addPattern("bear_flag", {
              direction: "continuation",
              entry: "short",
              option: "tight",
            })
          }
        />
      </CardContent>
    </Card>
  );
}


/* =========================================================
   Sub Component
   ========================================================= */

function PatternRow({
  label,
  patternKey,
  onChange,
  onAdd,
}: {
  label: string;
  patternKey: string;
  onChange: (v: any) => void;
  onAdd: () => void;
}) {
  const { rule } = useRuleStore();
  const item = rule.chartPattern.rules.find((r: any) => r.key === patternKey);

  if (!item) {
    return (
      <div className="grid grid-cols-4">
        <div className="font-medium">{label}</div>
        <button onClick={onAdd}>+ パターンを追加</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 items-start">
      <div className="text-sm font-medium pt-2">{label}</div>

      <Select
        value={item.params.direction}
        onValueChange={(v) =>
          onChange({ params: { ...item.params, direction: v } })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="reversal">反転</SelectItem>
          <SelectItem value="continuation">継続</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={item.params.entry}
        onValueChange={(v) =>
          onChange({ params: { ...item.params, entry: v } })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="long">ロング</SelectItem>
          <SelectItem value="short">ショート</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={item.params.option}
        onValueChange={(v) =>
          onChange({ params: { ...item.params, option: v } })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="neckline">ネックライン</SelectItem>
          <SelectItem value="tight">タイトレンジ</SelectItem>
          <SelectItem value="none">---</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
