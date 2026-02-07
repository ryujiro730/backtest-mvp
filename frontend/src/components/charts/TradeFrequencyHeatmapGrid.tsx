// frontend/src/components/charts/TradeFrequencyHeatmapGrid.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const dayMap: Record<string, string> = {
  sun: "日",
  mon: "月",
  tue: "火",
  wed: "水",
  thu: "木",
  fri: "金",
  sat: "土",
};

const hours = [
  "0-3", "3-6", "6-9", "9-12",
  "12-15", "15-18", "18-21", "21-24",
];

function intensityColor(value: number) {
  if (value > 35) return "bg-emerald-600 text-white";
  if (value > 25) return "bg-emerald-500 text-white";
  if (value > 15) return "bg-emerald-400";
  if (value > 5) return "bg-emerald-200";
  return "bg-gray-100";
}

export function TradeFrequencyHeatmapGrid({
  data = {},
}: {
  data?: Record<string, number>;
}) {
  const t = useTranslations("Charts.TradeFrequency");

  return (
    <div className="overflow-x-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `80px repeat(${hours.length}, minmax(56px, 1fr))`,
        }}
      >
        <div />
        {hours.map((h) => (
          <div key={h} className="text-xs text-muted-foreground text-center pb-2">
            {h}
          </div>
        ))}

        {dayKeys.map((dayKey) => {
          const jpDay = dayMap[dayKey]; // ← 内部キー（重要）

          return (
            <React.Fragment key={dayKey}>
              <div className="text-sm font-medium pr-2 flex items-center">
                {t(`days.${dayKey}`)}
              </div>

              {hours.map((hour) => {
                const key = `${jpDay}-${hour}`; // ← dataと一致
                const value = data[key] ?? 0;

                return (
                  <div
                    key={key}
                    className={cn(
                      "h-10 flex items-center justify-center text-xs rounded",
                      intensityColor(value)
                    )}
                  >
                    {value || ""}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
