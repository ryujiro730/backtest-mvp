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

const data = [
  { streak: "1連敗", count: 18 },
  { streak: "2連敗", count: 12 },
  { streak: "3連敗", count: 7 },
  { streak: "4連敗", count: 3 },
  { streak: "5連敗", count: 1 },
];

export function StreakBarChart() {
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
