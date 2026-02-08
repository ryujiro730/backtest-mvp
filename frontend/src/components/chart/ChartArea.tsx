"use client";

import { useEffect, useRef } from "react";

const LOAD_MORE_THRESHOLD = 100;

export type CandlestickBar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type ChartAreaProps = {
  bars: CandlestickBar[];
  /** 再生用: このインデックスまで表示。null のときは全本表示 */
  replayToIndex: number | null;
  onLoadMore?: () => void | Promise<void>;
  className?: string;
};

export function ChartArea({ bars, replayToIndex, onLoadMore, className }: ChartAreaProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const seriesRef = useRef<ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addCandlestickSeries"]
  > | null>(null);
  const loadingMoreRef = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || typeof window === "undefined" || bars.length === 0) return;

    let cancelled = false;

    void (async () => {
      const { createChart, ColorType } = await import("lightweight-charts");
      if (cancelled || !chartContainerRef.current) return;

      const textColor = "#1e293b";
      const gridColor = "#e2e8f0";
      const ch = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: gridColor,
        },
        rightPriceScale: {
          borderColor: gridColor,
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
      });

      const candlestickSeries = ch.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
      });

      chartRef.current = ch;
      seriesRef.current = candlestickSeries;

      const visibleBars = replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
      candlestickSeries.setData(visibleBars);
      ch.timeScale().fitContent();

      let initialFitDone = false;
      const timeScale = ch.timeScale();
      unsubRef.current = timeScale.subscribeVisibleLogicalRangeChange(async () => {
        if (!onLoadMore || loadingMoreRef.current || cancelled) return;
        const range = timeScale.getVisibleLogicalRange();
        if (!range) return;
        const from = range.from;
        if (!initialFitDone) {
          initialFitDone = true;
          return;
        }
        if (from > LOAD_MORE_THRESHOLD) return;
        loadingMoreRef.current = true;
        try {
          await onLoadMore();
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
        unsubRef.current?.();
        window.removeEventListener("resize", handleResize);
        ch.remove();
        chartRef.current = null;
        seriesRef.current = null;
        cleanupRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [bars.length, onLoadMore]);

  useEffect(() => {
    const series = seriesRef.current;
    const ch = chartRef.current;
    if (!series || !ch || bars.length === 0) return;
    const visibleBars = replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
    series.setData(visibleBars);
    ch.timeScale().fitContent();
  }, [bars, replayToIndex]);

  if (bars.length === 0) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <span className="text-sm text-muted-foreground">データなし</span>
      </div>
    );
  }

  return <div ref={chartContainerRef} className={className} />;
}
