"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Cell = {
  x: number; // hour
  y: number; // weekday
  value: number; // performance
};

const data: Cell[] = [
  { x: 9, y: 1, value: 0.8 },
  { x: 10, y: 1, value: 1.2 },
  { x: 11, y: 1, value: 1.6 },
  { x: 9, y: 2, value: 1.1 },
  { x: 10, y: 2, value: 1.9 },
];

function color(v: number) {
  if (v > 1.5) return "#22c55e"; // green
  if (v > 1.0) return "#eab308"; // yellow
  return "#ef4444"; // red
}

export function TimeHeatmap() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <XAxis
          type="number"
          dataKey="x"
          name="Hour"
          domain={[0, 23]}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Weekday"
          domain={[1, 7]}
        />
        <Tooltip
          formatter={(v: number) => `PF: ${v}`}
        />
        <Scatter
          data={data}
          shape={(props: any) => {
            const { cx, cy, payload } = props;
            return (
              <rect
                x={cx - 10}
                y={cy - 10}
                width={20}
                height={20}
                fill={color(payload.value)}
                rx={4}
              />
            );
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
