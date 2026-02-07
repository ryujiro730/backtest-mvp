"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { useRuleStore } from "../../rules/store";
import { useTranslations } from "next-intl";

/* =========================================================
   Time Zone（時間帯）
   ========================================================= */
export function TimeZoneSection() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);
  const setTimeZonePeriod = useRuleStore((s) => s.setTimeZonePeriod);
  const t = useTranslations("TimeZone");

  const period = rule.timeZone.period ?? { start: null, end: null };
  const days = rule.timeZone.daysOfWeek;
  const intraday = rule.timeZone.intraday;

  const weekDays = [
    { key: "mon", label: t("days.mon") },
    { key: "tue", label: t("days.tue") },
    { key: "wed", label: t("days.wed") },
    { key: "thu", label: t("days.thu") },
    { key: "fri", label: t("days.fri") },
    { key: "sat", label: t("days.sat") },
    { key: "sun", label: t("days.sun") },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* バックテスト期間（カレンダークリックで確実に反映） */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t("period.start")}</Label>
            <DatePickerField
              value={period.start}
              onChange={(v) => setTimeZonePeriod("start", v)}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("period.end")}</Label>
            <DatePickerField
              value={period.end}
              onChange={(v) => setTimeZonePeriod("end", v)}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>

        {/* 曜日 */}
        <div className="space-y-4">
          <Label>{t("days.label")}</Label>

          <div className="grid grid-cols-2 gap-y-3 gap-x-6 max-w-sm">
            {weekDays.map(({ key, label }) => (
              <DaySwitch
                key={key}
                label={label}
                checked={days[key]}
                onChange={(v) =>
                  update({
                    timeZone: {
                      ...rule.timeZone,
                      daysOfWeek: {
                        ...days,
                        [key]: v,
                      },
                    },
                  })
                }
              />
            ))}
          </div>
        </div>

        {/* 日中時間帯 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t("intraday.label")}</Label>
            <Switch
              checked={intraday.enabled}
              onCheckedChange={(v) =>
                update({
                  timeZone: {
                    ...rule.timeZone,
                    intraday: {
                      ...intraday,
                      enabled: v,
                    },
                  },
                })
              }
            />
          </div>

          {intraday.enabled && (
            <div className="grid grid-cols-2 gap-6 max-w-sm">
              <div className="space-y-2">
                <Label>{t("intraday.from")}</Label>
                <Input
                  type="time"
                  value={intraday.from}
                  onChange={(e) =>
                    update({
                      timeZone: {
                        ...rule.timeZone,
                        intraday: {
                          ...intraday,
                          from: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("intraday.to")}</Label>
                <Input
                  type="time"
                  value={intraday.to}
                  onChange={(e) =>
                    update({
                      timeZone: {
                        ...rule.timeZone,
                        intraday: {
                          ...intraday,
                          to: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Sub Component
   ========================================================= */

function DaySwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
