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
import { useTranslations } from "next-intl";

export function HourlyPerformanceChart({ data }: { data: HourlyPoint[] }) {
  const t = useTranslations("Charts.HourlyPerformance");

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tickFormatter={(v) => `${v}${t("hourSuffix")}`}
        />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, t("profit")]}
          labelFormatter={(l) => `${l}${t("hourSuffix")}`}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Bar dataKey="profit" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
