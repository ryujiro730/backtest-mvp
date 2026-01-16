"use client";

import { cn } from "@/lib/utils";

const days = ["月", "火", "水", "木", "金"];
const hours = [
  "0-3", "3-6", "6-9", "9-12",
  "12-15", "15-18", "18-21", "21-24",
];

// ダミー頻度データ（0〜40）
const data: Record<string, number> = {
  "月-6-9": 5, "月-9-12": 12, "月-12-15": 18,
  "火-9-12": 22, "火-12-15": 28, "火-15-18": 32,
  "水-9-12": 30, "水-12-15": 36, "水-15-18": 40,
  "木-9-12": 26, "木-12-15": 34, "木-15-18": 38,
  "金-9-12": 18, "金-12-15": 22, "金-15-18": 20,
};

function intensityColor(value: number) {
  if (value > 35) return "bg-emerald-600 text-white";
  if (value > 25) return "bg-emerald-500 text-white";
  if (value > 15) return "bg-emerald-400";
  if (value > 5) return "bg-emerald-200";
  return "bg-gray-100";
}

export function TradeFrequencyHeatmapGrid() {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `80px repeat(${hours.length}, minmax(56px, 1fr))`,
        }}
      >
        {/* Header */}
        <div />
        {hours.map((h) => (
          <div
            key={h}
            className="text-xs text-muted-foreground text-center pb-2"
          >
            {h}
          </div>
        ))}

        {/* Body */}
        {days.map((day) => (
          <>
            <div
              key={day}
              className="text-sm font-medium pr-2 flex items-center"
            >
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
          </>
        ))}
      </div>
    </div>
  );
}
