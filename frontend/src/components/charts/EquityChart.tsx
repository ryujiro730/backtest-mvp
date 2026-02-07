// frontend/src/components/charts/EquityChart.tsx
'use client';
import React, { useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Line, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush, ReferenceLine
} from "recharts";
import { thinData, CHART_MAX_POINTS } from "@/lib/utils/thin";

export function EquityChart({ data, height = 300 }: { data: any[]; height?: number }) {
  const toNum = (v: any) => {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    const n = Number(v); if (Number.isFinite(n)) return n;
    const ms = Date.parse(String(v)); return Number.isFinite(ms) ? ms : NaN;
  };

  const { displayData, xmin, xmax } = useMemo(() => {
    const pointsRaw = Array.isArray(data) ? data : [];
    const pts = pointsRaw
      .map((d: any) => ({ t: toNum(d?.t ?? d?.[0]), e: toNum(d?.e ?? d?.[1]) }))
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.e))
      .sort((a, b) => a.t - b.t);
    if (pts.length === 0) return { displayData: [], xmin: 0, xmax: 0 };
    const thinned = thinData(pts, CHART_MAX_POINTS);
    const base = thinned[0].e;
    const arr = thinned.map((p) => ({ x: p.t, equity: p.e, pnl: p.e - base }));
    return {
      displayData: arr,
      xmin: arr[0].x,
      xmax: arr[arr.length - 1].x,
    };
  }, [data]);

  if (displayData.length === 0) return <div className="text-sm text-gray-500">No equity data.</div>;
  const fmtDate = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  const [mode, setMode] = React.useState<"equity"|"pnl">("pnl");
  const yKey = mode === "pnl" ? "pnl" : "equity";
  const yLabel = mode === "pnl" ? "PnL (Δ from start)" : "Equity";

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">View:</span>
        <button className={`px-2 py-1 rounded-md border ${mode==="pnl"?"bg-black text-white":""}`} onClick={()=>setMode("pnl")}>PnL</button>
        <button className={`px-2 py-1 rounded-md border ${mode==="equity"?"bg-black text-white":""}`} onClick={()=>setMode("equity")}>Equity</button>
        <span className="ml-auto text-xs text-gray-500">n={displayData.length}</span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={displayData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <defs>
            <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={[xmin, xmax]} tickFormatter={fmtDate} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: any) => Number(v).toFixed(2)} label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 10 }} />
          <Tooltip labelFormatter={(ms) => fmtDate(Number(ms))} formatter={(val: any, name: string) => [Number(val).toFixed(4), name]} />
          <Legend />
          {mode==="pnl" ? <ReferenceLine y={0} stroke="currentColor" strokeDasharray="3 3" /> : <ReferenceLine y={displayData[0]?.equity ?? 0} stroke="currentColor" strokeDasharray="3 3" />}
          <Area type="monotone" dataKey={yKey} fill="url(#gradArea)" stroke="none" />
          <Line type="monotone" dataKey={yKey} strokeWidth={2} dot={false} isAnimationActive />
          <Brush dataKey="x" height={24} stroke="currentColor" travellerWidth={8} tickFormatter={fmtDate} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
