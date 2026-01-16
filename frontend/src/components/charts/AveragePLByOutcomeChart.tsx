// frontend/src/components/charts/AveragePLByOutcomeChart.tsx
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
  { outcome: "勝ち", avgPL: 120 },
  { outcome: "引き分け", avgPL: 5 },
  { outcome: "負け", avgPL: -45 },
];

export function AveragePLByOutcomeChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="outcome" />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, "平均損益"]}
        />
        <ReferenceLine y={0} stroke="#666" />
        <Bar
          dataKey="avgPL"
          radius={[6, 6, 0, 0]}
          fill="#22c55e"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
