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

import { useCatalog } from "@/features/run/hooks/useCatalog";
import { useRuleStore } from "@/rules/store";
import type { Direction } from "@/features/run/types";

export function ExecutionCondition() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);

  const { catalog, hasCatalog } = useCatalog();

  const { pair, timeframe, direction } = rule.meta;

  return (
    <Card>
      <CardHeader>
        <CardTitle>実行条件</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ================= 銘柄 ================= */}
        <div className="space-y-1">
          <Label>銘柄</Label>
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

        {/* ================= 時間足 ================= */}
        <div className="space-y-1">
          <Label>時間足</Label>
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
