"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Point = {
  duration: number; // 分
  profit: number;   // 損益
  result: "win" | "loss";
};

const data: Point[] = [
  { duration: 15, profit: 120, result: "win" },
  { duration: 30, profit: -80, result: "loss" },
  { duration: 45, profit: 200, result: "win" },
  { duration: 60, profit: -150, result: "loss" },
  { duration: 90, profit: 320, result: "win" },
  { duration: 120, profit: -220, result: "loss" },
  { duration: 180, profit: 400, result: "win" },
  { duration: 240, profit: -300, result: "loss" },
];

export function DurationProfitScatterChart() {
  const winData = data.filter(d => d.result === "win");
  const lossData = data.filter(d => d.result === "loss");

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="duration"
          name="保有時間"
          unit="分"
        />
        <YAxis
          type="number"
          dataKey="profit"
          name="損益"
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />

        <Scatter
          name="勝ちトレード"
          data={winData}
          fill="#22c55e"
        />
        <Scatter
          name="負けトレード"
          data={lossData}
          fill="#ef4444"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
