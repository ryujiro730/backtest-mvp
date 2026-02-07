// frontend/src/components/charts/AveragePLByOutcomeChart.tsx
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
import { useTranslations } from "next-intl";

export function AveragePLByOutcomeChart() {
  const t = useTranslations("Charts.AveragePLByOutcome");

  const data = [
    { outcome: t("win"), avgPL: 120 },
    { outcome: t("draw"), avgPL: 5 },
    { outcome: t("loss"), avgPL: -45 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="outcome" />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, t("avgPL")]}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Bar
          dataKey="avgPL"
          radius={[6, 6, 0, 0]}
          fill="#22c55e"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
