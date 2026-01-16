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

type EquityPoint = {
  date: string;
  long: number;
  short: number;
};

const data: EquityPoint[] = [
  { date: "01/01", long: 100000, short: 100000 },
  { date: "01/02", long: 101200, short: 99800 },
  { date: "01/03", long: 100800, short: 100300 },
  { date: "01/04", long: 102500, short: 99500 },
  { date: "01/05", long: 103200, short: 100100 },
  { date: "01/06", long: 102900, short: 100800 },
  { date: "01/07", long: 104500, short: 100200 },
];

export function EquityByTradeTypeChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="long"
          name="ロング"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="short"
          name="ショート"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
