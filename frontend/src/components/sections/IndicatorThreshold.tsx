// src/components/sections/IndicatorThreshold.tsx
"use client";

import { nanoid } from "nanoid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRuleStore } from "@/rules/store";
import { useTranslations } from "next-intl";

/* =========================================================
   Indicator Threshold
   ========================================================= */

export function IndicatorThreshold() {
  const rule = useRuleStore((s) => s.rule);
  const updateRule = useRuleStore((s) => s.update);
  const t = useTranslations("Indicator");

  const { logic, rules } = rule.indicatorThreshold;

  const updateRules = (next: any[]) =>
    updateRule({
      indicatorThreshold: {
        ...rule.indicatorThreshold,
        rules: next,
      },
    });

  const addRule = (direction: "long" | "short") =>
    updateRules([
      ...rules,
      {
        id: nanoid(),
        indicator: "rsi",
        direction,
        params: defaultParams("rsi"),
      },
    ]);

  const updateRuleItem = (id: string, patch: any) =>
    updateRules(
      rules.map((r: any) => (r.id === id ? { ...r, ...patch } : r))
    );

  const removeRule = (id: string) =>
    updateRules(rules.filter((r: any) => r.id !== id));

  const rulesLong = rules.filter((r: any) => r.direction === "long");
  const rulesShort = rules.filter((r: any) => r.direction === "short");

  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <CardTitle>{t("title")}</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {logic === "AND" ? t("logic.and") : t("logic.or")}
          </span>
          <Switch
            checked={logic === "AND"}
            onCheckedChange={(v) =>
              updateRule({
                indicatorThreshold: {
                  ...rule.indicatorThreshold,
                  logic: v ? "AND" : "OR",
                },
              })
            }
          />
          <span className="font-medium">{logic}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="long" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="long">{t("tabs.long")}</TabsTrigger>
            <TabsTrigger value="short">{t("tabs.short")}</TabsTrigger>
          </TabsList>
          <TabsContent value="long" className="mt-4 space-y-4">
            <IndicatorRulesList
              rules={rulesLong}
              updateRuleItem={updateRuleItem}
              removeRule={removeRule}
              addRule={() => addRule("long")}
              t={t}
              defaultParams={defaultParams}
            />
          </TabsContent>
          <TabsContent value="short" className="mt-4 space-y-4">
            <IndicatorRulesList
              rules={rulesShort}
              updateRuleItem={updateRuleItem}
              removeRule={removeRule}
              addRule={() => addRule("short")}
              t={t}
              defaultParams={defaultParams}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function IndicatorRulesList({
  rules,
  updateRuleItem,
  removeRule,
  addRule,
  t,
  defaultParams,
}: {
  rules: any[];
  updateRuleItem: (id: string, patch: any) => void;
  removeRule: (id: string) => void;
  addRule: () => void;
  t: (key: string) => string;
  defaultParams: (ind: string) => any;
}) {
  return (
    <>
        <Accordion type="multiple" className="space-y-2">
          {rules.map((r: any) => (
            <AccordionItem key={r.id} value={r.id}>
              <AccordionTrigger className="flex gap-4">
                <span className="font-medium uppercase">
                  {t(`indicators.${r.indicator}`)}
                </span>
                <span className="text-muted-foreground">
                  {t(`direction.${r.direction}`)}
                </span>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("fields.indicator")}>
                    <Select
                      value={r.indicator}
                      onValueChange={(v) =>
                        updateRuleItem(r.id, {
                          indicator: v,
                          params: defaultParams(v),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "rsi","sma","ema","macd","bbands","stoch",
                          "adx","cci","vwap","supertrend","donchian","breakout",
                        ].map((k) => (
                          <SelectItem key={k} value={k}>
                            {t(`indicators.${k}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label={t("fields.direction")}>
                    <Select
                      value={r.direction}
                      onValueChange={(v) =>
                        updateRuleItem(r.id, { direction: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">{t("direction.long")}</SelectItem>
                        <SelectItem value="short">{t("direction.short")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <IndicatorParamsForm
                  indicator={r.indicator}
                  params={r.params}
                  onChange={(params) =>
                    updateRuleItem(r.id, { params })
                  }
                />

                <Button
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => removeRule(r.id)}
                >
                  {t("actions.delete")}
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button variant="outline" onClick={addRule}>
          {t("actions.add")}
        </Button>
    </>
  );
}

/* =========================================================
   Params Forms（必須入力）
   ========================================================= */

function IndicatorParamsForm({
  indicator,
  params,
  onChange,
}: {
  indicator: string;
  params: any;
  onChange: (p: any) => void;
}) {
  switch (indicator) {

    /* ================= RSI ================= */
    case "rsi":
      return (
        <div className="grid grid-cols-3 gap-4">
          <Field label="期間">
            <Input type="number" value={params.length}
              onChange={e => onChange({ ...params, length: +e.target.value })} />
          </Field>

          <Field label="条件">
            <Select value={params.event}
              onValueChange={v => onChange({ ...params, event: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cross_down">下抜け</SelectItem>
                <SelectItem value="cross_up">上抜け</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="しきい値">
            <Input type="number" value={params.level}
              onChange={e => onChange({ ...params, level: +e.target.value })} />
          </Field>
        </div>
      );

    /* ================= SMA / EMA ================= */
    case "sma":
    case "ema":
      return (
        <div className="grid grid-cols-3 gap-4">
          <Field label="短期">
            <Input type="number" value={params.fast}
              onChange={e => onChange({ ...params, fast: +e.target.value })} />
          </Field>

          <Field label="長期">
            <Input type="number" value={params.slow}
              onChange={e => onChange({ ...params, slow: +e.target.value })} />
          </Field>

          <Field label="クロス">
            <Select value={params.cross}
              onValueChange={v => onChange({ ...params, cross: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="above">ゴールデンクロス</SelectItem>
                <SelectItem value="below">デッドクロス</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    /* ================= MACD ================= */
    case "macd":
      return (
        <div className="grid grid-cols-4 gap-4">
          <Field label="Fast">
            <Input type="number" value={params.fast}
              onChange={e => onChange({ ...params, fast: +e.target.value })} />
          </Field>
          <Field label="Slow">
            <Input type="number" value={params.slow}
              onChange={e => onChange({ ...params, slow: +e.target.value })} />
          </Field>
          <Field label="Signal">
            <Input type="number" value={params.signal}
              onChange={e => onChange({ ...params, signal: +e.target.value })} />
          </Field>
          <Field label="条件">
            <Select value={params.event}
              onValueChange={v => onChange({ ...params, event: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cross_up">上抜け</SelectItem>
                <SelectItem value="cross_down">下抜け</SelectItem>
                <SelectItem value="above_zero">0以上</SelectItem>
                <SelectItem value="below_zero">0以下</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    /* ================= Bollinger Bands ================= */
    case "bbands":
      return (
        <div className="grid grid-cols-3 gap-4">
          <Field label="期間">
            <Input type="number" value={params.length}
              onChange={e => onChange({ ...params, length: +e.target.value })} />
          </Field>
          <Field label="σ">
            <Input type="number" value={params.mult}
              onChange={e => onChange({ ...params, mult: +e.target.value })} />
          </Field>
          <Field label="条件">
            <Select value={params.event}
              onValueChange={v => onChange({ ...params, event: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cross_above_upper">上抜け</SelectItem>
                <SelectItem value="cross_below_lower">下抜け</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    /* ================= Stochastic ================= */
    case "stoch":
      return (
        <div className="grid grid-cols-5 gap-4">
          <Num label="K" v={params.k} f={v => onChange({ ...params, k: v })} />
          <Num label="D" v={params.d} f={v => onChange({ ...params, d: v })} />
          <Num label="Smooth" v={params.smooth} f={v => onChange({ ...params, smooth: v })} />
          <Num label="OB" v={params.overbought} f={v => onChange({ ...params, overbought: v })} />
          <Num label="OS" v={params.oversold} f={v => onChange({ ...params, oversold: v })} />
        </div>
      );

    /* ================= ADX / CCI ================= */
    case "adx":
    case "cci":
      return (
        <div className="grid grid-cols-3 gap-4">
          <Num label="期間" v={params.length} f={v => onChange({ ...params, length: v })} />
          <Num label="しきい値" v={params.level} f={v => onChange({ ...params, level: v })} />
          <Field label="条件">
            <Select value={params.event}
              onValueChange={v => onChange({ ...params, event: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gt">以上</SelectItem>
                <SelectItem value="lt">以下</SelectItem>
                <SelectItem value="cross_up">上抜け</SelectItem>
                <SelectItem value="cross_down">下抜け</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    /* ================= VWAP ================= */
    case "vwap":
      return (
        <Field label="条件">
          <Select value={params.event}
            onValueChange={v => onChange({ ...params, event: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="price_cross_above">上抜け</SelectItem>
              <SelectItem value="price_cross_below">下抜け</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      );

    /* ================= SuperTrend ================= */
    case "supertrend":
      return (
        <div className="grid grid-cols-3 gap-4">
          <Num label="期間" v={params.length} f={v => onChange({ ...params, length: v })} />
          <Num label="倍率" v={params.multiplier} f={v => onChange({ ...params, multiplier: v })} />
          <Field label="条件">
            <Select value={params.event}
              onValueChange={v => onChange({ ...params, event: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trend_up">上昇トレンド</SelectItem>
                <SelectItem value="trend_down">下降トレンド</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    /* ================= Donchian / Breakout ================= */
    case "donchian":
    case "breakout":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Num label="期間" v={params.lookback} f={v => onChange({ ...params, lookback: v })} />
          <Field label="方向">
            <Select value={params.side}
              onValueChange={v => onChange({ ...params, side: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">高値</SelectItem>
                <SelectItem value="low">安値</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    default:
      return null;
  }
}


/* =========================================================
   Defaults
   ========================================================= */

function defaultParams(ind: string) {
  switch (ind) {
    case "rsi": return { length: 14, level: 30, event: "cross_down" };
    case "sma":
    case "ema": return { fast: 12, slow: 26, cross: "above" };
    case "macd": return { fast: 12, slow: 26, signal: 9, event: "cross_up" };
    case "bbands": return { length: 20, mult: 2, event: "cross_below_lower" };
    case "stoch": return { k: 14, d: 3, smooth: 3, overbought: 80, oversold: 20 };
    case "adx": return { length: 14, level: 25, event: "gt" };
    case "cci": return { length: 20, level: 100, event: "cross_up" };
    case "vwap": return { event: "price_cross_above" };
    case "supertrend": return { length: 10, multiplier: 3, event: "trend_up" };
    case "donchian":
    case "breakout": return { lookback: 20, side: "high" };
    default: return {};
  }
}

function Field({ label, children }: any) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function Num({ label, v, f }: any) {
  return (
    <Field label={label}>
      <Input type="number" value={v} onChange={e => f(+e.target.value)} />
    </Field>
  );
}
