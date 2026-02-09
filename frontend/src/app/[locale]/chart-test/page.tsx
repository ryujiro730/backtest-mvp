"use client";

import { useEffect, useRef, useState } from "react";

const INITIAL_LIMIT = 2000;
const LOAD_MORE_LIMIT = 2000;
const LOAD_MORE_THRESHOLD = 100; // 左端からこの本数以内になったら追加取得

type CandlestickData = { time: number; open: number; high: number; low: number; close: number };
type ApiBar = { time: number; open: number; high: number; low: number; close: number };

function toBars(rows: ApiBar[]): CandlestickData[] {
  return rows.map((b) => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close }));
}

async function fetchBars(before?: number): Promise<CandlestickData[]> {
  const url = before
    ? `/api/chart-data?pair=EURUSD&timeframe=H1&limit=${LOAD_MORE_LIMIT}&before=${before}`
    : `/api/chart-data?pair=EURUSD&timeframe=H1&limit=${INITIAL_LIMIT}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const raw = await res.json();
  return toBars(Array.isArray(raw) ? raw : []);
}

export default function ChartTestPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>("読み込み中...");
  const cleanupRef = useRef<(() => void) | null>(null);
  const allBarsRef = useRef<CandlestickData[]>([]);
  const loadingMoreRef = useRef(false);
  const reachedStartRef = useRef(false); // Parquet の先頭に到達したら true

  useEffect(() => {
    if (!chartContainerRef.current || typeof window === "undefined") return;

    let cancelled = false;
    let candlestickSeries: ReturnType<ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]> | null = null;
    let unsub: (() => void) | null = null;

    (async () => {
      const t0 = performance.now();
      let bars: CandlestickData[];
      try {
        bars = await fetchBars();
      } catch (e) {
        if (!cancelled) setStatus("API 取得失敗: " + String(e));
        return;
      }
      if (cancelled || !chartContainerRef.current || bars.length === 0) return;

      allBarsRef.current = bars;
      if (!cancelled) setStatus(`${bars.length} 本表示（左にスクロールで Parquet の古いデータを追加読み込み）`);

      const { createChart, CandlestickSeries, ColorType } = await import("lightweight-charts");
      const ch = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#0f172a" },
          textColor: "#e2e8f0",
        },
        grid: {
          vertLines: { color: "#1e293b" },
          horzLines: { color: "#1e293b" },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: "#334155",
        },
        rightPriceScale: {
          borderColor: "#334155",
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
      });

      candlestickSeries = ch.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
      });

      candlestickSeries!.setData(bars);
      ch.timeScale().fitContent();
      console.log(`[chart-test] 初回: ${(performance.now() - t0).toFixed(0)}ms, ${bars.length} 本`);

      const timeScale = ch.timeScale();
      let initialFitDone = false;
      unsub = timeScale.subscribeVisibleLogicalRangeChange(async (range) => {
        if (!range || loadingMoreRef.current || cancelled || reachedStartRef.current) return;
        const from = range.from;
        if (!initialFitDone) {
          initialFitDone = true;
          return;
        }
        if (from > LOAD_MORE_THRESHOLD) return;
        const oldest = allBarsRef.current[0]?.time;
        if (oldest == null) return;
        loadingMoreRef.current = true;
        try {
          const older = await fetchBars(oldest);
          if (cancelled) return;
          if (older.length === 0) {
            reachedStartRef.current = true;
            setStatus(`${allBarsRef.current.length} 本表示（Parquet 全データ）`);
            return;
          }
          const merged = [...older, ...allBarsRef.current].sort((a, b) => a.time - b.time);
          const deduped = merged.filter((b, i) => i === 0 || b.time !== merged[i - 1].time);
          const added = deduped.length - allBarsRef.current.length;
          const visible = timeScale.getVisibleLogicalRange();
          allBarsRef.current = deduped;
          candlestickSeries?.setData(deduped);
          if (visible && added > 0) {
            timeScale.setVisibleLogicalRange({
              from: visible.from + added,
              to: visible.to + added,
            });
          }
          setStatus(`${deduped.length} 本表示（左にスクロールで Parquet の古いデータを追加読み込み）`);
        } finally {
          loadingMoreRef.current = false;
        }
      });

      const handleResize = () => {
        if (chartContainerRef.current && ch) {
          ch.applyOptions({ width: chartContainerRef.current.clientWidth });
          ch.applyOptions({ height: chartContainerRef.current.clientHeight });
        }
      };
      window.addEventListener("resize", handleResize);
      cleanupRef.current = () => {
        unsub?.();
        window.removeEventListener("resize", handleResize);
        ch?.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-900">
      <header className="flex items-center gap-2 border-b border-slate-700 px-4 py-2 text-slate-200">
        <span className="font-semibold">Chart Test</span>
        <span className="text-sm text-slate-400">{status}</span>
      </header>
      <div ref={chartContainerRef} className="flex-1 min-h-0 w-full" />
    </div>
  );
}
