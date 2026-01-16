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
  { hour: "0", profit: -120 },
  { hour: "1", profit: -80 },
  { hour: "2", profit: 40 },
  { hour: "3", profit: 120 },
  { hour: "4", profit: 300 },
  { hour: "5", profit: 500 },
  { hour: "6", profit: 700 },
  { hour: "7", profit: 900 },
  { hour: "8", profit: 1100 },
  { hour: "9", profit: 1400 },
  { hour: "10", profit: 800 },
  { hour: "11", profit: 300 },
  { hour: "12", profit: -200 },
  { hour: "13", profit: -400 },
  { hour: "14", profit: 100 },
  { hour: "15", profit: 600 },
  { hour: "16", profit: 1200 },
  { hour: "17", profit: 1600 },
  { hour: "18", profit: 900 },
  { hour: "19", profit: 400 },
  { hour: "20", profit: 200 },
  { hour: "21", profit: -100 },
  { hour: "22", profit: -300 },
  { hour: "23", profit: -500 },
];

export function HourlyPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" tickFormatter={(v) => `${v}時`} />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, "損益"]}
          labelFormatter={(l) => `${l}時`}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Bar dataKey="profit" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
