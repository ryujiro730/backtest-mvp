//frontend/src/components/charts/DurationProfitScatterChart.tsx
"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DurationScatterPoint } from "@/lib/performance/transform";
import { useTranslations } from "next-intl";

export function DurationProfitScatterChart({
  data,
}: {
  data: DurationScatterPoint[];
}) {
  const t = useTranslations("Charts.DurationProfit");

  const winData = data.filter((d) => d.result === "win");
  const lossData = data.filter((d) => d.result === "loss");

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="duration"
          name={t("xName")}
          unit={t("xUnit")}
        />
        <YAxis
          type="number"
          dataKey="profit"
          name={t("yName")}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />

        <Scatter
          name={t("win")}
          data={winData}
          fill="#22c55e"
        />
        <Scatter
          name={t("loss")}
          data={lossData}
          fill="#ef4444"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
