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
import { useTranslations } from "next-intl";

export function ReturnDistributionChart({ data }: { data: ReturnBin[] }) {
  const t = useTranslations("Charts.ReturnDistribution");

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip formatter={(v: number) => [`${v}`, t("count")]} />
        <Bar dataKey="count" fill="#06b6d4" />
      </BarChart>
    </ResponsiveContainer>
  );
}
