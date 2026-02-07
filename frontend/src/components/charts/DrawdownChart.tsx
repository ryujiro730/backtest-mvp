// frontend/src/components/charts/DrawdownChart.tsx
"use client";

import { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";

export function DrawdownChart({
  data,
  onReady,
}: {
  data: any[];
  onReady?: () => void;
}) {
  const t = useTranslations("Charts.Drawdown");

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="t" />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, t("dd")]}
        />
        <Area
          type="monotone"
          dataKey="dd"
          stroke="#ef4444"
          fill="#fecaca"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
