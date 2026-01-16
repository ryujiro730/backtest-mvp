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

const data = [
  { date: "01/01", dd: 0 },
  { date: "01/02", dd: -200 },
  { date: "01/03", dd: -800 },
  { date: "01/04", dd: -300 },
  { date: "01/05", dd: -1200 },
  { date: "01/06", dd: -500 },
  { date: "01/07", dd: -700 },
];

export function DrawdownChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
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
