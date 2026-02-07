// frontend/src/components/charts/EquityByTradeTypeChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

type EquityPoint = {
  date: string;
  long: number;
  short: number;
};

export function EquityByTradeTypeChart({ data }: { data: EquityPoint[] }) {
  const t = useTranslations("Charts.EquityByTradeType");

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />

        <YAxis
          domain={[
            (dataMin: number) => Math.min(dataMin, -0.05),
            (dataMax: number) => Math.max(dataMax, 0.05),
          ]}
        />

        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="long"
          name={t("long")}
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="short"
          name={t("short")}
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
