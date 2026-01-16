// frontend/src/components/charts/TradeFrequencyHeatmapGrid.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

const days = ["日", "月", "火", "水", "木", "金", "土"];
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

export function TradeFrequencyHeatmapGrid({ data = {} }: { data?: Record<string, number> }) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `80px repeat(${hours.length}, minmax(56px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div />
        {hours.map((h) => (
          <div key={h} className="text-xs text-muted-foreground text-center pb-2">
            {h}
          </div>
        ))}

        {/* Body rows */}
{days.map((day) => (
  <React.Fragment key={day}>
    <div className="text-sm font-medium pr-2 flex items-center">
      {day}
    </div>

    {hours.map((hour) => {
      const key = `${day}-${hour}`;
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
))}

      </div>
    </div>
  );
}
