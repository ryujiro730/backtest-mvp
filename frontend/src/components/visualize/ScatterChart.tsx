"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = {
  x: number;
  y: number;
};

const data: Point[] = [
  { x: 10, y: 1.2 },
  { x: 20, y: 1.4 },
  { x: 30, y: 1.8 },
  { x: 40, y: 1.1 },
  { x: 50, y: 2.0 },
];

export function ParamScatter() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name="RSI"
          label={{ value: "RSI", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Profit Factor"
          label={{ value: "PF", angle: -90, position: "insideLeft" }}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill="hsl(var(--primary))" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
