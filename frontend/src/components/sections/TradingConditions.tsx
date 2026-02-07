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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { UnitInput } from "@/components/common/UnitInput";
import { useRuleStore } from "../../rules/store";
import { useTranslations } from "next-intl";

export function TradingConditions() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);
  const t = useTranslations("TradingConditions");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* 積み増し（ピラミッディング） */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
          <div>
            <Label className="font-medium">{t("fields.allowPyramid")}</Label>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("fields.allowPyramidDesc")}
            </p>
          </div>
          <Switch
            checked={rule.tradingConditions.allowPyramid ?? false}
            onCheckedChange={(v) =>
              update({
                tradingConditions: {
                  ...rule.tradingConditions,
                  allowPyramid: v,
                },
              })
            }
          />
        </div>

        {/* 基本コスト */}
        <div className="grid grid-cols-2 gap-6">
          <Field label={t("fields.balance")}>
            <UnitInput
              unit={t("units.yen")}
              value={rule.tradingConditions.balance}
              onChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    balance: v === "" ? 0 : Number(v),
                  },
                })
              }
            />
          </Field>

          <Field label={t("fields.spread")}>
            <UnitInput
              unit={t("units.pips")}
              value={rule.tradingConditions.spread}
              onChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    spread: v === "" ? 0 : Number(v),
                  },
                })
              }
            />
          </Field>

          <Field label={t("fields.slippage")}>
            <UnitInput
              unit={t("units.pips")}
              value={rule.tradingConditions.slippage}
              onChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    slippage: v === "" ? 0 : Number(v),
                  },
                })
              }
            />
          </Field>

          <Field label={t("fields.swap")}>
            <UnitInput
              unit={t("units.yen")}
              value={rule.tradingConditions.swap}
              onChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    swap: v === "" ? 0 : Number(v),
                  },
                })
              }
            />
          </Field>

          <Field label={t("fields.commission")}>
            <UnitInput
              unit={t("units.yenPerLot")}
              value={rule.tradingConditions.commission}
              onChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    commission: v === "" ? 0 : Number(v),
                  },
                })
              }
            />
          </Field>
        </div>

        {/* レバレッジ / マージン */}
        <div className="grid grid-cols-2 gap-6">
          <Field label={t("fields.leverage")}>
            <Select
              value={String(rule.tradingConditions.leverage)}
              onValueChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    leverage: Number(v),
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["25", "50", "100", "200", "500"].map((v) => (
                  <SelectItem key={v} value={v}>
                    1 : {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t("fields.marginCall")}>
            <UnitInput
              unit={t("units.percent")}
              value={rule.tradingConditions.marginCall}
              onChange={(v) =>
                update({
                  tradingConditions: {
                    ...rule.tradingConditions,
                    marginCall: v === "" ? 0 : Number(v),
                  },
                })
              }
            />
          </Field>
        </div>

        {/* ロットモード */}
        <div className="space-y-3">
          <Label>{t("fields.lotMode")}</Label>

          <RadioGroup
            value={rule.tradingConditions.lotMode}
            onValueChange={(v) =>
              update({
                tradingConditions: {
                  ...rule.tradingConditions,
                  lotMode: v as "fixed" | "dynamic",
                },
              })
            }
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="fixed" />
              <div>
                <div className="font-medium">{t("fields.fixedLot")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("fields.fixedLotDesc")}
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="dynamic" />
              <div>
                <div className="font-medium">{t("fields.dynamicLot")}</div>
                <div className="text-sm text-muted-foreground">
                  {t("fields.dynamicLotDesc")}
                </div>
              </div>
            </label>
          </RadioGroup>

          {rule.tradingConditions.lotMode === "fixed" && (
            <Field label={t("fields.lotSize")}>
              <UnitInput
                unit="lot"
                value={rule.tradingConditions.lotSize}
                onChange={(v) =>
                  update({
                    tradingConditions: {
                      ...rule.tradingConditions,
                      lotSize: v === "" ? 0 : Number(v),
                    },
                  })
                }
              />
            </Field>
          )}

          {rule.tradingConditions.lotMode === "dynamic" && (
            <Field label={t("fields.riskPct")}>
              <UnitInput
                unit={t("units.percent")}
                value={rule.tradingConditions.riskPct}
                onChange={(v) =>
                  update({
                    tradingConditions: {
                      ...rule.tradingConditions,
                      riskPct: v === "" ? 0 : Number(v),
                    },
                  })
                }
              />
            </Field>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ===== 小物 ===== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
