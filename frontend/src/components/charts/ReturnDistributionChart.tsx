// frontend/src/components/charts/ReturnDistributionChart.tsx
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
import type { ReturnBin } from "@/lib/performance/transform";

export function ReturnDistributionChart({ data }: { data: ReturnBin[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip formatter={(v: number) => [`${v}`, "トレード数"]} />
        <Bar dataKey="count" fill="#06b6d4" />
      </BarChart>
    </ResponsiveContainer>
  );
}
