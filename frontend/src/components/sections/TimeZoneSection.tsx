"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRuleStore } from "../../rules/store";

/* =========================================================
   Time Zone（時間帯）
   ========================================================= */
export function TimeZoneSection() {
const rule = useRuleStore((s) => s.rule);
const update = useRuleStore((s) => s.update);


  const days = rule.timeZone.daysOfWeek;
  const intraday = rule.timeZone.intraday;
  const weekDays = [
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
  { key: "sun", label: "日" },
] as const;


  return (
    <Card>
      <CardHeader>
        <CardTitle>時間帯</CardTitle>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* ================================
           バックテスト期間
        ================================= */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>バックテスト開始日</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>バックテスト終了日</Label>
            <Input type="date" />
          </div>
        </div>

        {/* ================================
           曜日
        ================================= */}
        <div className="space-y-4">
          <Label>曜日</Label>

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

        {/* ================================
           日中時間帯
        ================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>日中の時間帯のみ有効</Label>
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
                <Label>開始時刻</Label>
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
                <Label>終了時刻</Label>
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
