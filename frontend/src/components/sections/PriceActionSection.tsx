// src/components/sections/PriceActionSection.tsx
"use client";

import { nanoid } from "nanoid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useRuleStore } from "@/rules/store";

export function PriceActionSection() {
  const rule = useRuleStore(s => s.rule);
  const update = useRuleStore(s => s.update);

  const pa = rule.priceAction;
  const { rules } = pa;

  const updateRules = (next: any[]) =>
    update({
      priceAction: {
        ...pa,
        rules: next,
      },
    });

  // 追加
  const addRule = () =>
    updateRules([
      ...rules,
      {
        id: nanoid(),
        key: "pinbar",
        type: "price",
        direction: "long",
        params: {
          signal: "bullish",
          entrySide: "long",
        },
      },
    ]);

  // 個別更新
  const updateRuleItem = (id: string, patch: any) =>
    updateRules(rules.map(r => (r.id === id ? { ...r, ...patch } : r)));

  // 削除
  const removeRule = (id: string) =>
    updateRules(rules.filter(r => r.id !== id));

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>プライスアクション</CardTitle>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {pa.logic === "AND" ? "すべて満たす" : "いずれか"}
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
        <Accordion type="multiple" className="space-y-2">
          {rules.map((r) => (
            <AccordionItem key={r.id} value={r.id}>
              <AccordionTrigger className="flex gap-4">
                <span className="font-medium">{displayName(r.key)}</span>
                <span className="text-muted-foreground">
                  {r.params.signal === "bullish" ? "強気" : "弱気"}
                  {" → "}
                  {r.params.entrySide === "long" ? "ロング" : "ショート"}
                </span>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-4">
                {/* パターン名選択 */}
                <div>
                  <Label>パターン</Label>
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
                      <SelectItem value="pinbar">ピンバー</SelectItem>
                      <SelectItem value="inside_bar">インサイドバー</SelectItem>
                      <SelectItem value="three_bar">3バーリバーサル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* シグナル／エントリー方向 */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="シグナル方向">
                    <Select
                      value={r.params.signal}
                      onValueChange={(v) =>
                        updateRuleItem(r.id, {
                          params: { ...r.params, signal: v },
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">強気</SelectItem>
                        <SelectItem value="bearish">弱気</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="エントリー方向">
                    <Select
                      value={r.params.entrySide}
                      onValueChange={(v) =>
                        updateRuleItem(r.id, {
                          params: { ...r.params, entrySide: v },
                        })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">ロング</SelectItem>
                        <SelectItem value="short">ショート</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Button
                  variant="ghost"
                  className="text-red-500"
                  onClick={() => removeRule(r.id)}
                >
                  削除
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button variant="outline" onClick={addRule}>
          + パターンを追加
        </Button>
      </CardContent>
    </Card>
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
    case "pinbar": return "ピンバー";
    case "inside_bar": return "インサイドバー";
    case "three_bar": return "3バーリバーサル";
    default: return key;
  }
}
