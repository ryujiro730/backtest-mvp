"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * ダミーデータ
 * 曜日 × 時間帯 の損益（例）
 */
const days = ["月", "火", "水", "木", "金"];
const hours = ["09", "10", "11", "12", "13", "14", "15", "16"];

const data: Record<string, number[]> = {
  月: [120, 80, -40, 60, 200, 150, 90, -20],
  火: [60, -10, 30, 140, 220, 180, 70, 40],
  水: [-80, -40, 20, 100, 160, 200, 130, 60],
  木: [40, 70, 110, 180, 240, 210, 150, 90],
  金: [90, 120, 160, 200, 260, 230, 180, 140],
};

/**
 * 値 → 色
 */
function heatColor(value: number) {
  if (value <= -50) return "bg-red-500/70 text-white";
  if (value < 0) return "bg-red-400/40";
  if (value < 50) return "bg-emerald-200";
  if (value < 150) return "bg-emerald-400 text-white";
  return "bg-emerald-600 text-white";
}

export function TimeHeatmap() {
  return (
    <div className="overflow-x-auto">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">曜日</TableHead>
            {hours.map((h) => (
              <TableHead key={h} className="text-center">
                {h}:00
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {days.map((day) => (
            <TableRow key={day}>
              <TableCell className="font-medium">{day}</TableCell>
              {data[day].map((value, i) => (
                <TableCell
                  key={i}
                  className={cn(
                    "text-center font-semibold transition-colors",
                    heatColor(value)
                  )}
                >
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
