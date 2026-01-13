// RuinChart.tsx
"use client";
import { useMemo, useRef, useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Label,
} from "recharts";
import { riskOfRuinRunApprox, kellyFraction } from "@/lib/math/balsara";

type Props = {
  p: number; rr: number; n: number; ruinFrac: number; f: number;
  fMaxPct?: number; samples?: number; height?: number;
};

export default function RuinChart({
  p, rr, n, ruinFrac, f,
  fMaxPct = 30, samples, height = 300,
}: Props) {
  const kelly = useMemo(() => kellyFraction({ p, rr }), [p, rr]);

  // ---- データは細かく作る（0.5%刻み以上）----
  const effSamples = useMemo(() => {
    const minSamples = Math.floor(fMaxPct / 0.5) + 1;
    const base = samples ?? 121;               // だいたい 0.25%〜0.5% 刻み
    return Math.max(base, minSamples);
  }, [samples, fMaxPct]);

  const data = useMemo(() => {
    const arr: { fPct: number; rorPct: number }[] = [];
    const step = fMaxPct / (effSamples - 1);
    for (let i = 0; i < effSamples; i++) {
      const fPct = i * step;
      const ror = riskOfRuinRunApprox({ p, rr, n, ruinFrac, f: fPct / 100 });
      arr.push({ fPct, rorPct: ror * 100 });
    }
    return arr;
  }, [p, rr, n, ruinFrac, fMaxPct, effSamples]);

  // ---- 90%以上が3%連続で上限ストップ（既存仕様）----
  const { yTop } = useMemo(() => {
    let start = -1, span = 0, bestTop = 0;
    const stepF = data.length > 1 ? data[1].fPct - data[0].fPct : fMaxPct;
    for (let i = 0; i < data.length; i++) {
      if (data[i].rorPct >= 90) {
        if (start === -1) start = i;
        span = (i - start) * stepF;
        if (span >= 3 - 1e-9) {
          const segMax = Math.max(...data.slice(start, i + 1).map(d => d.rorPct));
          bestTop = Math.ceil(Math.min(100, segMax));
          break;
        }
      } else {
        start = -1;
      }
    }
    const maxRor = Math.max(0, ...data.map(d => d.rorPct));
    const top = bestTop || Math.min(100, Math.max(1, Math.ceil(maxRor)));
    return { yTop: top };
  }, [data, fMaxPct]);

  // ---------- ここがキモ：表示ラベルの自動粒度 ----------
  // コンテナ幅を観測して、1ラベルあたり最低ピクセルを確保
// いい感じの刻み幅を選ぶ（1/2/5/10系で丸め）
function niceStep(max: number, targetTicks: number) {
  const raw = Math.max(max, 1) / Math.max(targetTicks, 1);
  const candidates = [1, 2, 5, 10, 20];
  // 10の位・1の位などにスケール
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const scaled = candidates.map(c => c * mag);
  // raw以上で最小のものを採用
  return scaled.find(s => s >= raw) ?? scaled[scaled.length - 1];
}

// --- ここから：X/Y の ticks を作る ---
const boxRef = useRef<HTMLDivElement>(null);
const [width, setWidth] = useState(800);
useEffect(() => {
  if (!boxRef.current) return;
  const ro = new ResizeObserver((e) => setWidth(Math.floor(e[0].contentRect.width)));
  ro.observe(boxRef.current);
  return () => ro.disconnect();
}, []);

// X軸：幅に対して出せる本数から刻みを決める（最低28px/ラベルを確保）
const maxXTicks = Math.max(2, Math.floor(width / 28));
const xStep = useMemo(() => {
  // fMaxPct を xStep で割った本数が maxXTicks 以下になるように
  const rough = Math.ceil(fMaxPct / maxXTicks);
  // 1/2/5/10 のナイス刻みに寄せる
  return niceStep(fMaxPct, Math.floor(fMaxPct / rough));
}, [fMaxPct, maxXTicks]);

const xTicks = useMemo(() => {
  const ticks: number[] = [];
  for (let v = 0; v <= fMaxPct; v += xStep) ticks.push(Math.round(v));
  if (ticks[ticks.length - 1] !== fMaxPct) ticks.push(fMaxPct);
  return ticks;
}, [fMaxPct, xStep]);

// Y軸：上限 yTop に対して5〜7本を目標に刻みを決める
const yStep = useMemo(() => niceStep(yTop, 6), [yTop]);
const yTicks = useMemo(() => {
  const ticks: number[] = [];
  for (let v = 0; v <= yTop; v += yStep) ticks.push(Math.round(v));
  if (ticks[ticks.length - 1] !== yTop) ticks.push(yTop);
  return ticks;
}, [yTop, yStep]);

  // -----------------------------------------------------

  const fmt = (v: number) => `${Math.round(v)}%`;

  // ホバー中の十字線（“正確値”を常に見せる）
  const [hoverF, setHoverF] = useState<number | null>(null);
  const [hoverR, setHoverR] = useState<number | null>(null);

  return (
    <div className="rounded-xl border p-4" ref={boxRef}>
      <div className="mb-2 text-sm text-gray-500">リスク率 f に対する破産確率（他パラメータ固定）</div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
<LineChart
  data={data}
  margin={{ top: 24, right: 24, bottom: 44, left: 56 }}
>
<Tooltip
  cursor={{ strokeDasharray: "3 3" }}   // ← 縦のガイド線（カーソル）
  formatter={(v: number) => [`${(Math.round(v*10)/10).toFixed(1)}%`, "破産確率"]}
  labelFormatter={(l: number) => `f = ${Math.round(l*10)/10}%`} // x軸のf
  wrapperStyle={{ fontSize: 12 }}
/>
            <CartesianGrid strokeDasharray="3 3" />
<XAxis
  dataKey="fPct"
  type="number"
  domain={[0, fMaxPct]}
  ticks={xTicks}
  interval={0}                       // ← 自動間引きOFF
  tickFormatter={(v) => `${v}%`}
  tick={{ fontSize: 11, fill: "#9CA3AF" }}
>
  <Label value="リスク率 f（%）" position="insideBottom" offset={-28}
         style={{ fill: "#9CA3AF", fontSize: 12 }} />
</XAxis>

<YAxis
  domain={[0, yTop]}
  ticks={yTicks}
  interval={0}                       // ← 自動間引きOFF
  tickFormatter={(v) => `${v}%`}
  tick={{ fontSize: 11, fill: "#9CA3AF" }}
  allowDecimals={false}
>
  <Label value="破産確率（%）" angle={-90} position="insideLeft" offset={-40}
         style={{ fill: "#9CA3AF", fontSize: 12 }} />
</YAxis>

            <Tooltip
              formatter={(v: number) => [`${(Math.round(v*10)/10).toFixed(1)}%`, "破産確率"]}
              labelFormatter={(l: number) => `f = ${fmt(l)}`}
              wrapperStyle={{ fontSize: 12 }}
            />

            {/* ホバー十字線＋バッジ */}
            {hoverF !== null && (
              <ReferenceLine x={hoverF} strokeDasharray="3 3">
                <Label
                  value={`f=${(hoverF).toFixed(1)}% / RoR=${hoverR?.toFixed(1) ?? "-"}%`}
                  position="insideTop" offset={12}
                  style={{ fontSize: 11, fill: "#9CA3AF" }}
                />
              </ReferenceLine>
            )}

            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="rorPct" name="破産確率" dot={false} strokeWidth={2} />
            <ReferenceLine x={f*100} strokeDasharray="4 4">
              <Label value={`現在 f=${(f*100).toFixed(1)}%`} position="top" offset={12}
                     style={{ fontSize: 11, fill: "#9CA3AF" }} />
            </ReferenceLine>
<ReferenceLine x={kelly * 100} strokeDasharray="4 4">
  <Label
    value={`Kelly ${(kelly * 100).toFixed(1)}%`}
    position="insideTopLeft"
    dx={-64}
    dy={-24}
    style={{ fontSize: 11, fill: "#9CA3AF" }}
  />
</ReferenceLine>

          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        近似: 連敗ベース・独立試行・固定f。ホバーで正確値を表示。
      </p>
    </div>
  );
}
