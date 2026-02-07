// src/components/sections/PriceActionSection.tsx
"use client";

import { nanoid } from "nanoid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRuleStore } from "@/rules/store";
import { useTranslations } from "next-intl";

export function PriceActionSection() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);
  const t = useTranslations("PriceAction");

  const pa = rule.priceAction;
  const { rules } = pa;

  const updateRules = (next: any[]) =>
    update({
      priceAction: {
        ...pa,
        rules: next,
      },
    });

  const addRule = (entrySide: "long" | "short") =>
    updateRules([
      ...rules,
      {
        id: nanoid(),
        key: "pinbar",
        type: "price",
        direction: entrySide,
        params: {
          signal: entrySide === "long" ? "bullish" : "bearish",
          entrySide,
        },
      },
    ]);

  // 個別更新
  const updateRuleItem = (id: string, patch: any) =>
    updateRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // 削除
  const removeRule = (id: string) =>
    updateRules(rules.filter((r) => r.id !== id));

  const rulesLong = rules.filter((r) => r.params?.entrySide === "long");
  const rulesShort = rules.filter((r) => r.params?.entrySide === "short");

  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <CardTitle>{t("title")}</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {pa.logic === "AND" ? t("logic.and") : t("logic.or")}
          </span>
          <Switch
            checked={pa.logic === "AND"}
            onCheckedChange={(v) =>
              update({
                priceAction: {
                  ...pa,
                  logic: v ? "AND" : "OR",
                },
              })
            }
          />
          <span className="font-medium">{pa.logic}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="long" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="long">{t("tabs.long")}</TabsTrigger>
            <TabsTrigger value="short">{t("tabs.short")}</TabsTrigger>
          </TabsList>
          <TabsContent value="long" className="mt-4">
            <PriceActionRulesList
              rules={rulesLong}
              updateRuleItem={updateRuleItem}
              removeRule={removeRule}
              addRule={() => addRule("long")}
              t={t}
              displayName={displayName}
              defaultParams={defaultParams}
            />
          </TabsContent>
          <TabsContent value="short" className="mt-4">
            <PriceActionRulesList
              rules={rulesShort}
              updateRuleItem={updateRuleItem}
              removeRule={removeRule}
              addRule={() => addRule("short")}
              t={t}
              displayName={displayName}
              defaultParams={defaultParams}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PriceActionRulesList({
  rules,
  updateRuleItem,
  removeRule,
  addRule,
  t,
  displayName,
  defaultParams,
}: {
  rules: any[];
  updateRuleItem: (id: string, patch: any) => void;
  removeRule: (id: string) => void;
  addRule: () => void;
  t: (key: string, opts?: any) => string;
  displayName: (key: string) => string;
  defaultParams: (key: string) => any;
}) {
  return (
    <>
        <Accordion type="multiple" className="space-y-2">
          {rules.map((r) => (
            <AccordionItem key={r.id} value={r.id}>
              <AccordionTrigger className="flex gap-4">
                <span className="font-medium">
                  {t("patternName", { value: displayName(r.key) })}
                </span>
                <span className="text-muted-foreground">
                  {r.params.signal === "bullish"
                    ? t("signal.bullish")
                    : t("signal.bearish")}
                  {" → "}
                  {r.params.entrySide === "long"
                    ? t("entry.long")
                    : t("entry.short")}
                </span>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-4">
                {/* パターン名選択 */}
                <div>
                  <Label>{t("labels.pattern")}</Label>
                  <Select
                    value={r.key}
                    onValueChange={(v) =>
                      updateRuleItem(r.id, {
                        key: v,
                        params: defaultParams(v),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pinbar">
                        {t("patterns.pinbar")}
                      </SelectItem>
                      <SelectItem value="inside_bar">
                        {t("patterns.inside_bar")}
                      </SelectItem>
                      <SelectItem value="three_bar">
                        {t("patterns.three_bar")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* シグナル／エントリー方向 */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t("labels.signal")}>
                    <Select
                      value={r.params.signal}
                      onValueChange={(v) =>
                        updateRuleItem(r.id, {
                          params: { ...r.params, signal: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">
                          {t("signal.bullish")}
                        </SelectItem>
                        <SelectItem value="bearish">
                          {t("signal.bearish")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label={t("labels.entry")}>
                    <Select
                      value={r.params.entrySide}
                      onValueChange={(v) =>
                        updateRuleItem(r.id, {
                          params: { ...r.params, entrySide: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">
                          {t("entry.long")}
                        </SelectItem>
                        <SelectItem value="short">
                          {t("entry.short")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Button
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => removeRule(r.id)}
                >
                  {t("actions.remove")}
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

function Field({ label, children }: any) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

// ↓↓↓ 以下ロジック完全ノータッチ ↓↓↓

function defaultParams(key: string) {
  switch (key) {
    case "pinbar":
      return { signal: "bullish", entrySide: "long" };
    case "inside_bar":
      return { signal: "bullish", entrySide: "long" };
    case "three_bar":
      return { signal: "bullish", entrySide: "long" };
    default:
      return { signal: "bullish", entrySide: "long" };
  }
}

function displayName(key: string) {
  switch (key) {
    case "pinbar":
      return "ピンバー";
    case "inside_bar":
      return "インサイドバー";
    case "three_bar":
      return "3バーリバーサル";
    default:
      return key;
  }
}
