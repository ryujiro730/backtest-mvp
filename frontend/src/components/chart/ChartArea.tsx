"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const LOAD_MORE_THRESHOLD = 100;
const REPLAY_VISIBLE_BARS = 150;
const OSCILLATOR_PANE_HEIGHT = 120;

export type CandlestickBar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type EntryMarker = { time: number; side: "Long" | "Short" };

export type IndicatorSeries = {
  key: string;
  data: { time: number; value: number }[];
  color: string;
};

type ChartAreaProps = {
  bars: CandlestickBar[];
  replayToIndex: number | null;
  replayTime?: number | null;
  rightMargin?: boolean;
  entryMarkers?: EntryMarker[];
  exitMarkers?: EntryMarker[];
  indicatorSeries?: IndicatorSeries[];
  oscillatorSeries?: IndicatorSeries[];
  onLoadMore?: () => void | Promise<void>;
  /** 有効時のみチャートクリックでその足の logical インデックスをコールバック（TradingView リプレイ風）。クリック時は params.logical のみ使用 */
  onBarClick?: (barIndex: number) => void;
  className?: string;
};

export type ChartAreaHandle = {
  resize: (width: number, height: number) => void;
};

export const ChartArea = forwardRef<ChartAreaHandle, ChartAreaProps>(function ChartArea(
  {
    bars,
    replayToIndex,
    replayTime = null,
    rightMargin = true,
    entryMarkers = [],
    exitMarkers = [],
    indicatorSeries = [],
    oscillatorSeries = [],
    onLoadMore,
    onBarClick,
    className,
  },
  ref
) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const lwcRef = useRef<typeof import("lightweight-charts") | null>(null);
  const onBarClickRef = useRef(onBarClick);
  onBarClickRef.current = onBarClick;
  const barsRef = useRef(bars);
  const replayToIndexRef = useRef(replayToIndex);
  barsRef.current = bars;
  replayToIndexRef.current = replayToIndex;
  const candlestickSeriesRef = useRef<ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]
  > | null>(null);
  const seriesMarkersRef = useRef<{ setMarkers: (m: unknown[]) => void } | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]
  >>>(new Map());
  const oscillatorSeriesRef = useRef<Map<string, ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]
  >>>(new Map());
  const loadingMoreRef = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const rightMarginRef = useRef(rightMargin);
  const [chartReady, setChartReady] = useState(false);
  rightMarginRef.current = rightMargin;
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const lastAppliedReplayTimeRef = useRef<number | null>(undefined);
  const prevVisibleBarsLengthRef = useRef<number>(0);

  useImperativeHandle(
    ref,
    () => ({
      resize(width: number, height: number) {
        const ch = chartRef.current;
        if (!ch) return;
        ch.applyOptions({ width, height });
        ch.timeScale().applyOptions({
          rightOffset: rightMarginRef.current ? Math.max(10, Math.round((width * 0.2) / 6)) : 0,
        });
        if (oscillatorSeriesRef.current.size > 0) {
          const panes = ch.panes();
          if (panes.length > 1) {
            panes[1].setHeight(OSCILLATOR_PANE_HEIGHT);
          }
        }
      },
    }),
    []
  );

  // 単一チャート作成（v5: パネル対応。オシレーターは pane 1）
  useEffect(() => {
    if (!chartContainerRef.current || bars.length === 0) return;
    let cancelled = false;
    const replayTimeForInit = replayTime;

    void (async () => {
      const lwc = await import("lightweight-charts");
      lwcRef.current = lwc;
      const {
        createChart,
        CandlestickSeries,
        createSeriesMarkers,
        ColorType,
      } = lwc;
      if (cancelled || !chartContainerRef.current) return;

      const textColor = "#1e293b";
      const gridColor = "#e2e8f0";
      const container = chartContainerRef.current;
      const ch = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor,
          panes: {
            separatorColor: gridColor,
            separatorHoverColor: "#cbd5e1",
            enableResize: false,
          },
        },
        grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
        width: container.clientWidth,
        height: container.clientHeight,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: gridColor,
          rightOffset: rightMargin
            ? Math.max(10, Math.round((container.clientWidth * 0.2) / 6))
            : 0,
        },
        rightPriceScale: {
          borderColor: gridColor,
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
      });

      const candlestickSeries = ch.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
      });
      chartRef.current = ch;
      candlestickSeriesRef.current = candlestickSeries;
      seriesMarkersRef.current = createSeriesMarkers(candlestickSeries, []);
      setChartReady(true);

      const visibleBars = replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
      candlestickSeries.setData(visibleBars);
      prevVisibleBarsLengthRef.current = visibleBars.length;
      const timeScale = ch.timeScale();
      if (replayToIndex != null) {
        const from = Math.max(0, replayToIndex - REPLAY_VISIBLE_BARS);
        timeScale.setVisibleLogicalRange({ from, to: replayToIndex });
      } else {
        timeScale.fitContent();
      }
      lastAppliedReplayTimeRef.current = replayTimeForInit ?? null;

      let initialFitDone = false;
      unsubRef.current = timeScale.subscribeVisibleLogicalRangeChange(async () => {
        const onLoadMoreFn = onLoadMoreRef.current;
        if (!onLoadMoreFn || loadingMoreRef.current || cancelled) return;
        const range = timeScale.getVisibleLogicalRange();
        if (!range) return;
        if (!initialFitDone) {
          initialFitDone = true;
          return;
        }
        if (range.from > LOAD_MORE_THRESHOLD) return;
        loadingMoreRef.current = true;
        try {
          await onLoadMoreFn();
        } finally {
          loadingMoreRef.current = false;
        }
      });

      const applyResize = (w: number, h: number) => {
        ch.applyOptions({ width: w, height: h });
        ch.timeScale().applyOptions({
          rightOffset: rightMarginRef.current ? Math.max(10, Math.round((w * 0.2) / 6)) : 0,
        });
        const panes = ch.panes();
        if (panes.length > 1) {
          panes[1].setHeight(OSCILLATOR_PANE_HEIGHT);
        }
      };
      const handleResize = () => {
        if (chartContainerRef.current && ch) {
          applyResize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
        }
      };
      window.addEventListener("resize", handleResize);
      const resizeObserver = new ResizeObserver((entries) => {
        if (cancelled || !ch) return;
        const entry = entries[0];
        if (!entry) return;
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) applyResize(width, height);
      });
      if (chartContainerRef.current) resizeObserver.observe(chartContainerRef.current);

      cleanupRef.current = () => {
        unsubRef.current?.();
        window.removeEventListener("resize", handleResize);
        resizeObserver.disconnect();
        lwcRef.current = null;
        seriesMarkersRef.current = null;
        ch.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
        indicatorSeriesRef.current.clear();
        oscillatorSeriesRef.current.clear();
        setChartReady(false);
      };
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, [bars.length > 0]);

  // データ・マーカー・オーバーレイ・オシレーター・表示範囲の更新
  useEffect(() => {
    const candleSeries = candlestickSeriesRef.current;
    const ch = chartRef.current;
    const container = chartContainerRef.current;
    if (!candleSeries || !ch || bars.length === 0) return;

    const timeScale = ch.timeScale();
    const shouldUpdateRange =
      replayTime === undefined ||
      replayTime === null ||
      replayTime !== lastAppliedReplayTimeRef.current;
    const savedRange = shouldUpdateRange ? null : timeScale.getVisibleLogicalRange();

    const visibleBars = replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
    candleSeries.setData(visibleBars);

    const entryMarkerData = entryMarkers.map((m, i) => ({
      time: m.time,
      position: (m.side === "Long" ? "belowBar" : "aboveBar") as const,
      shape: (m.side === "Long" ? "arrowUp" : "arrowDown") as const,
      color: m.side === "Long" ? "#2563eb" : "#dc2626",
      id: `entry-${i}`,
    }));
    const exitMarkerData = exitMarkers.map((m, i) => ({
      time: m.time,
      position: (m.side === "Long" ? "belowBar" : "aboveBar") as const,
      shape: (m.side === "Long" ? "arrowUp" : "arrowDown") as const,
      color: m.side === "Long" ? "#2563eb" : "#dc2626",
      id: `exit-${i}`,
    }));
    const allMarkers = [...entryMarkerData, ...exitMarkerData].sort((a, b) => a.time - b.time);
    seriesMarkersRef.current?.setMarkers(allMarkers);

    // オーバーレイ（pane 0）
    const currentOverlayKeys = new Set(indicatorSeries.map((s) => s.key));
    indicatorSeriesRef.current.forEach((lineSeries, key) => {
      if (!currentOverlayKeys.has(key)) {
        ch.removeSeries(lineSeries);
        indicatorSeriesRef.current.delete(key);
      }
    });
    const { LineSeries } = lwcRef.current ?? {};
    if (LineSeries) {
      indicatorSeries.forEach((ind) => {
        let lineSeries = indicatorSeriesRef.current.get(ind.key);
        if (!lineSeries) {
          lineSeries = ch.addSeries(LineSeries, {
            color: ind.color,
            lineWidth: 2,
            priceScaleId: "right",
          });
          indicatorSeriesRef.current.set(ind.key, lineSeries);
        }
        lineSeries.setData(ind.data);
        lineSeries.applyOptions({ color: ind.color });
      });
    }

    // オシレーター（pane 1）: 1チャート内の第2パネル
    const currentOscKeys = new Set(oscillatorSeries.map((s) => s.key));
    const panes = ch.panes();
    oscillatorSeriesRef.current.forEach((lineSeries, key) => {
      if (!currentOscKeys.has(key)) {
        ch.removeSeries(lineSeries);
        oscillatorSeriesRef.current.delete(key);
      }
    });
    if (oscillatorSeries.length > 0 && LineSeries) {
      oscillatorSeries.forEach((ind) => {
        let lineSeries = oscillatorSeriesRef.current.get(ind.key);
        if (!lineSeries) {
          lineSeries = ch.addSeries(
            LineSeries,
            { color: ind.color, lineWidth: 2, priceScaleId: "right" },
            1
          );
          oscillatorSeriesRef.current.set(ind.key, lineSeries);
        }
        lineSeries.setData(ind.data);
        lineSeries.applyOptions({ color: ind.color });
      });
      const panesAfter = ch.panes();
      if (panesAfter.length > 1) {
        panesAfter[1].setHeight(OSCILLATOR_PANE_HEIGHT);
      }
    }
    if (oscillatorSeries.length === 0) {
      const panesNow = ch.panes();
      if (panesNow.length > 1) {
        ch.removePane(1);
      }
    }

    const rightOffsetVal =
      container && rightMargin
        ? Math.max(10, Math.round((container.clientWidth * 0.2) / 6))
        : 0;
    if (container) {
      timeScale.applyOptions({ rightOffset: rightOffsetVal });
    }

    if (shouldUpdateRange) {
      lastAppliedReplayTimeRef.current = replayTime ?? null;
      if (replayToIndex != null) {
        const from = Math.max(0, replayToIndex - REPLAY_VISIBLE_BARS);
        timeScale.setVisibleLogicalRange({ from, to: replayToIndex });
      } else {
        timeScale.fitContent();
      }
    } else if (savedRange) {
      const delta = visibleBars.length - prevVisibleBarsLengthRef.current;
      const rangeToRestore =
        delta > 0
          ? { from: savedRange.from + delta, to: savedRange.to + delta }
          : savedRange;
      timeScale.setVisibleLogicalRange(rangeToRestore);
    }
    prevVisibleBarsLengthRef.current = visibleBars.length;
  }, [bars, replayToIndex, replayTime, rightMargin, entryMarkers, exitMarkers, indicatorSeries, oscillatorSeries, chartReady]);

  // リプレイ地点選択: クリックした足のインデックスを親に渡す。logical が無い場合は point.x から coordinateToLogical で算出
  const clickHandlerRef = useRef<((params: { logical?: number; point?: { x: number } }) => void) | null>(null);
  useEffect(() => {
    if (!chartReady || !onBarClick || !chartRef.current) return;
    const ch = chartRef.current;
    const timeScale = ch.timeScale();
    const handler = (params: { logical?: number; point?: { x: number } }) => {
      let logical: number | undefined = params.logical;
      if (typeof logical !== "number" && typeof params.point?.x === "number") {
        logical = timeScale.coordinateToLogical(params.point.x);
      }
      if (typeof logical !== "number" || !Number.isFinite(logical)) return;
      const b = barsRef.current;
      const rti = replayToIndexRef.current;
      const visibleLen = rti != null ? rti + 1 : b.length;
      if (visibleLen === 0) return;
      const barIndex = Math.max(0, Math.min(visibleLen - 1, Math.floor(logical)));
      onBarClickRef.current?.(barIndex);
    };
    clickHandlerRef.current = handler;
    ch.subscribeClick(handler);
    return () => {
      if (clickHandlerRef.current) ch.unsubscribeClick(clickHandlerRef.current);
      clickHandlerRef.current = null;
    };
  }, [chartReady, onBarClick]);

  // モバイル向けタッチタップ検出（subscribeClick はモバイルで発火しないため補完）
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!onBarClickRef.current || !chartRef.current || !touchStartRef.current) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - touchStartRef.current.x);
    const dy = Math.abs(t.clientY - touchStartRef.current.y);
    touchStartRef.current = null;
    // 10px 以上動いた場合はパン操作とみなしてスキップ
    if (dx > 10 || dy > 10) return;
    const container = chartContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = t.clientX - rect.left;
    const timeScale = chartRef.current.timeScale();
    const logical = timeScale.coordinateToLogical(x);
    if (typeof logical !== "number" || !Number.isFinite(logical)) return;
    const b = barsRef.current;
    const rti = replayToIndexRef.current;
    const visibleLen = rti != null ? rti + 1 : b.length;
    if (visibleLen === 0) return;
    const barIndex = Math.max(0, Math.min(visibleLen - 1, Math.floor(logical)));
    onBarClickRef.current(barIndex);
  };

  // リプレイモードON時: マウス位置に赤い縦線を表示（カット位置を明示）
  const [replayLineX, setReplayLineX] = useState<number | null>(null);
  const crosshairHandlerRef = useRef<((params: { point?: { x: number } }) => void) | null>(null);
  useEffect(() => {
    if (!chartReady || !chartRef.current) return;
    const ch = chartRef.current;
    if (!onBarClick) {
      setReplayLineX(null);
      return;
    }
    const handler = (params: { point?: { x: number } }) => {
      setReplayLineX(params.point?.x ?? null);
    };
    crosshairHandlerRef.current = handler;
    ch.subscribeCrosshairMove(handler);
    return () => {
      if (crosshairHandlerRef.current) ch.unsubscribeCrosshairMove(crosshairHandlerRef.current);
      crosshairHandlerRef.current = null;
      setReplayLineX(null);
    };
  }, [chartReady, onBarClick]);

  // オシレーター系列のデータだけ更新（パネルは既にある）
  useEffect(() => {
    if (oscillatorSeries.length === 0) return;
    oscillatorSeries.forEach((ind) => {
      const lineSeries = oscillatorSeriesRef.current.get(ind.key);
      if (lineSeries) {
        lineSeries.setData(ind.data);
        lineSeries.applyOptions({ color: ind.color });
      }
    });
  }, [oscillatorSeries]);

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

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: "100%" }}
        onTouchStart={onBarClick ? handleTouchStart : undefined}
        onTouchEnd={onBarClick ? handleTouchEnd : undefined}
      />
      {replayLineX != null && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
        >
          <div
            style={{
              position: "absolute",
              left: replayLineX,
              top: 0,
              bottom: 0,
              width: 2,
              background: "#ef4444",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      )}
    </div>
  );
});
