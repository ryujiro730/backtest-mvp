// frontend/src/components/charts/HourlyPerformanceChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { HourlyPoint } from "@/lib/performance/transform";

export function HourlyPerformanceChart({ data }: { data: HourlyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tickFormatter={(v) => `${v}時`}
        />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, "損益"]}
          labelFormatter={(l) => `${l}時`}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Bar dataKey="profit" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
