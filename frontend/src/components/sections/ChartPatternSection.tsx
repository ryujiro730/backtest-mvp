"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogicSwitch } from "../common/LogicSwitch";
import { useRuleStore } from "../../rules/store";
import { useTranslations } from "next-intl";

type EntrySide = "long" | "short";

/* =========================================================
   Chart Pattern Section
   ========================================================= */
export function ChartPatternSection() {
  const { rule, update } = useRuleStore();
  const cp = rule.chartPattern;
  const t = useTranslations("ChartPattern");

  const updateRules = (rules: any[]) =>
    update({
      chartPattern: {
        ...cp,
        rules,
      },
    });

  const updateRuleItem = (key: string, entry: EntrySide, patch: any) =>
    updateRules(
      cp.rules.map((r: any) =>
        r.key === key && r.params?.entry === entry ? { ...r, ...patch } : r
      )
    );

  const addPattern = (key: string, entry: EntrySide, params: Record<string, string>) =>
    updateRules([
      ...cp.rules,
      {
        id: crypto.randomUUID(),
        type: "chartPattern",
        key,
        params: { ...params, entry },
      },
    ]);

  const renderPatternRows = (entry: EntrySide) => (
    <>
      <PatternRow
        label={t("patterns.head_and_shoulders")}
        patternKey="head_and_shoulders"
        entry={entry}
        onChange={(values) =>
          updateRuleItem("head_and_shoulders", entry, values)
        }
        onAdd={() =>
          addPattern("head_and_shoulders", entry, {
            direction: "reversal",
            option: "neckline",
          })
        }
      />
      <PatternRow
        label={t("patterns.ascending_triangle")}
        patternKey="ascending_triangle"
        entry={entry}
        onChange={(values) =>
          updateRuleItem("ascending_triangle", entry, values)
        }
        onAdd={() =>
          addPattern("ascending_triangle", entry, {
            direction: "reversal",
            option: "none",
          })
        }
      />
      <PatternRow
        label={t("patterns.bear_flag")}
        patternKey="bear_flag"
        entry={entry}
        onChange={(values) =>
          updateRuleItem("bear_flag", entry, values)
        }
        onAdd={() =>
          addPattern("bear_flag", entry, {
            direction: "continuation",
            option: "tight",
          })
        }
      />
    </>
  );

  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>{t("title")}</CardTitle>
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

      <CardContent className="space-y-4">
        <Tabs defaultValue="long" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="long">{t("tabs.long")}</TabsTrigger>
            <TabsTrigger value="short">{t("tabs.short")}</TabsTrigger>
          </TabsList>
          <TabsContent value="long" className="mt-4 space-y-6">
            {renderPatternRows("long")}
          </TabsContent>
          <TabsContent value="short" className="mt-4 space-y-6">
            {renderPatternRows("short")}
          </TabsContent>
        </Tabs>
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
  entry,
  onChange,
  onAdd,
}: {
  label: string;
  patternKey: string;
  entry: EntrySide;
  onChange: (v: any) => void;
  onAdd: () => void;
}) {
  const { rule } = useRuleStore();
  const t = useTranslations("ChartPattern");

  const item = rule.chartPattern.rules.find(
    (r: any) => r.key === patternKey && r.params?.entry === entry
  );

  if (!item) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
        <div className="font-medium text-sm">{label}</div>
        <button
          type="button"
          className="text-left text-sm text-primary hover:underline"
          onClick={onAdd}
        >
          {t("actions.add")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-start">
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
          <SelectItem value="reversal">
            {t("direction.reversal")}
          </SelectItem>
          <SelectItem value="continuation">
            {t("direction.continuation")}
          </SelectItem>
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
          <SelectItem value="neckline">
            {t("option.neckline")}
          </SelectItem>
          <SelectItem value="tight">
            {t("option.tight")}
          </SelectItem>
          <SelectItem value="none">
            {t("option.none")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
