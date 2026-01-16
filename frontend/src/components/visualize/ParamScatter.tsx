"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * ダミーデータ
 * x: TP（pips）
 * y: SL（pips）
 * z: 総損益（サイズで表現）
 */
const data = [
  { tp: 20, sl: 10, profit: 120 },
  { tp: 30, sl: 15, profit: 240 },
  { tp: 40, sl: 20, profit: -80 },
  { tp: 50, sl: 25, profit: 310 },
  { tp: 60, sl: 30, profit: 90 },
];

export function ParamScatter() {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            type="number"
            dataKey="tp"
            name="TP"
            unit=" pips"
            label={{ value: "TP（pips）", position: "insideBottom", offset: -10 }}
          />

          <YAxis
            type="number"
            dataKey="sl"
            name="SL"
            unit=" pips"
            label={{ value: "SL（pips）", angle: -90, position: "insideLeft" }}
          />

          <ZAxis
            type="number"
            dataKey="profit"
            range={[60, 300]}
            name="総損益"
          />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "TP") return [`${value} pips`, "TP"];
              if (name === "SL") return [`${value} pips`, "SL"];
              if (name === "総損益") return [`${value}`, "総損益"];
              return value;
            }}
          />

          <Scatter
            data={data}
            fill="hsl(var(--primary))"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
