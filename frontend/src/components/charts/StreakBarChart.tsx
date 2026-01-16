// frontend/src/components/charts/StreakBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { StreakPoint } from "@/lib/performance/transform";

export function StreakBarChart({ data }: { data: StreakPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="streak" />
        <YAxis />
        <Tooltip formatter={(v: number) => [`${v}`, "発生回数"]} />
        <Bar dataKey="count" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
