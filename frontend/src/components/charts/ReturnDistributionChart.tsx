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

/**
 * ビンごとの度数データ（ヒストグラム）
 * range: 損益レンジ
 * count: トレード数
 */
const data = [
  { range: "-80 ~ -60", count: 8 },
  { range: "-60 ~ -40", count: 14 },
  { range: "-40 ~ -20", count: 22 },
  { range: "-20 ~ 0", count: 30 },
  { range: "0 ~ 20", count: 35 },
  { range: "20 ~ 40", count: 28 },
  { range: "40 ~ 60", count: 20 },
  { range: "60 ~ 80", count: 12 },
  { range: "80 ~ 120", count: 6 },
  { range: "120 ~ 160", count: 3 },
  { range: "160 ~ 200", count: 2 },
];

export function ReturnDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip
          formatter={(v: number) => [`${v}`, "トレード数"]}
        />
        <Bar dataKey="count" fill="#06b6d4" />
      </BarChart>
    </ResponsiveContainer>
  );
}
