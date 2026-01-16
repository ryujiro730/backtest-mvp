//frontend/src/components/charts/DrawdownChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


export function DrawdownChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="t" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="dd" stroke="#ef4444" fill="#fecaca" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
