// rules/sections/TimeZoneSection.tsx
"use client";

import { useRuleStore } from "../store";

const DAYS: { key: any; label: string }[] = [
  { key: "mon", label: "月" },
  { key: "tue", label: "火" },
  { key: "wed", label: "水" },
  { key: "thu", label: "木" },
  { key: "fri", label: "金" },
  { key: "sat", label: "土" },
  { key: "sun", label: "日" },
];

export function TimeZoneSection() {
  const { rule, setDayEnabled, setIntraday } = useRuleStore();
  const tz = rule.timeZone;

  return (
    <div className="space-y-4">
      <h3 className="font-bold">時間帯</h3>

      {/* Days of Week */}
      <div>
        <div className="font-medium mb-2">曜日</div>
        <div className="flex gap-3 flex-wrap">
          {DAYS.map((d) => (
            <label key={d.key} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={tz.daysOfWeek[d.key]}
                onChange={(e) => setDayEnabled(d.key, e.target.checked)}
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      {/* Intraday Range */}
      <div>
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={tz.intraday.enabled}
            onChange={(e) => setIntraday("enabled", e.target.checked)}
          />
          日中の時間帯
        </label>

        {tz.intraday.enabled && (
          <div className="flex gap-4 mt-2">
            <label>
              開始
              <input
                type="time"
                value={tz.intraday.from}
                onChange={(e) => setIntraday("from", e.target.value)}
              />
            </label>

            <label>
              終了
              <input
                type="time"
                value={tz.intraday.to}
                onChange={(e) => setIntraday("to", e.target.value)}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
