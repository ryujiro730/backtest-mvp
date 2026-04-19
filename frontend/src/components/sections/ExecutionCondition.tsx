"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coins, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCatalog, groupPairs } from "@/features/run/hooks/useCatalog";
import { useRuleStore } from "@/rules/store";

export function ExecutionCondition() {
  const t = useTranslations("ExecutionCondition");

  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);

  const { catalog, hasCatalog, catalogError } = useCatalog();

  const { pair, timeframe } = rule.meta;

  return (
    <Card className="rounded-xl border border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {catalogError && (
          <p className="col-span-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {catalogError}
          </p>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Coins className="h-3.5 w-3.5" />
            {t("pair")}
          </Label>
          <Select
            value={pair}
            disabled={!hasCatalog}
            onValueChange={(v) =>
              update({
                meta: { ...rule.meta, pair: v },
              })
            }
          >
            <SelectTrigger className="w-full max-w-[200px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                const { crypto, fx } = groupPairs(catalog.pairs);
                return (
                  <>
                    {fx.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>FX</SelectLabel>
                        {fx.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectGroup>
                    )}
                    {fx.length > 0 && crypto.length > 0 && <SelectSeparator />}
                    {crypto.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Crypto</SelectLabel>
                        {crypto.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectGroup>
                    )}
                  </>
                );
              })()}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {t("timeframe")}
          </Label>
          <Select
            value={timeframe}
            disabled={!hasCatalog}
            onValueChange={(v) =>
              update({
                meta: { ...rule.meta, timeframe: v },
              })
            }
          >
            <SelectTrigger className="w-full max-w-[200px] rounded-lg">
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
