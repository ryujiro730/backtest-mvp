"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { date: "01/01", equity: 100000 },
  { date: "01/02", equity: 101200 },
  { date: "01/03", equity: 100400 },
  { date: "01/04", equity: 102800 },
  { date: "01/05", equity: 101600 },
  { date: "01/06", equity: 104200 },
  { date: "01/07", equity: 103500 },
];

export function EquityCurveChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="equity"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
