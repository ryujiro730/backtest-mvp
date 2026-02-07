// frontend/src/components/charts/WeekdayBarChart.tsx
"use client";

import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { WeekdayPoint } from "@/lib/performance/transform";

export function WeekdayBarChart({
  data,
  onReady,
}: {
  data: WeekdayPoint[];
  onReady?: () => void;
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="profit" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
