"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTranslations } from "next-intl";
import { useCatalog } from "@/features/run/hooks/useCatalog";
import { useRuleStore } from "@/rules/store";
import type { Direction } from "@/features/run/types";

export function ExecutionCondition() {
  const t = useTranslations("ExecutionCondition");

  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);

  const { catalog, hasCatalog } = useCatalog();

  const { pair, timeframe } = rule.meta;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ================= Pair ================= */}
        <div className="space-y-1">
          <Label>{t("pair")}</Label>
          <Select
            value={pair}
            disabled={!hasCatalog}
            onValueChange={(v) =>
              update({
                meta: {
                  ...rule.meta,
                  pair: v,
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {catalog.pairs.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ================= Timeframe ================= */}
        <div className="space-y-1">
          <Label>{t("timeframe")}</Label>
          <Select
            value={timeframe}
            disabled={!hasCatalog}
            onValueChange={(v) =>
              update({
                meta: {
                  ...rule.meta,
                  timeframe: v,
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {catalog.timeframes.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
