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

const data = [
  { day: "月", profit: 1200 },
  { day: "火", profit: -400 },
  { day: "水", profit: 900 },
  { day: "木", profit: 300 },
  { day: "金", profit: 1500 },
];

export function WeekdayBarChart() {
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
