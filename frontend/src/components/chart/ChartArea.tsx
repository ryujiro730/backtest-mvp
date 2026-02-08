"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const LOAD_MORE_THRESHOLD = 100;
/** 再生モードで画面に収めるバー数（この範囲で setVisibleLogicalRange する） */
const REPLAY_VISIBLE_BARS = 150;

export type CandlestickBar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

/** チャートに表示するエントリーマーカー（買い/売り） */
export type EntryMarker = { time: number; side: "Long" | "Short" };

/** インジケータライン用データ */
export type IndicatorSeries = {
  key: string;
  data: { time: number; value: number }[];
  color: string;
};

type ChartAreaProps = {
  bars: CandlestickBar[];
  /** 再生用: このインデックスまで表示。null のときは全本表示 */
  replayToIndex: number | null;
  /** 再生位置の時刻。これが変わったときだけ表示範囲を更新（スクロール・ズームは維持） */
  replayTime?: number | null;
  /** 右余白（MT5風）を入れるか。再生時も setVisibleLogicalRange で効く */
  rightMargin?: boolean;
  /** エントリーした足に表示するマーカー（ロング＝青▲、ショート＝赤▼） */
  entryMarkers?: EntryMarker[];
  /** 決済した足に表示するマーカー（逆ポジション＝ロング決済は赤▼、ショート決済は青▲） */
  exitMarkers?: EntryMarker[];
  /** インジケータライン（価格軸に重ねる: SMA, EMA, BB, MACD 等） */
  indicatorSeries?: IndicatorSeries[];
  /** 下部オシレーターゾーンに表示するライン（RSI, Stoch 等 0-100 系） */
  oscillatorSeries?: IndicatorSeries[];
  onLoadMore?: () => void | Promise<void>;
  className?: string;
};

const OSCILLATOR_PANE_HEIGHT = 120;

export type ChartAreaHandle = {
  /** ドラッグ中などに親から強制リサイズする用 */
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
    className,
  },
  ref
) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const oscillatorContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const oscillatorChartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const oscillatorSeriesRef = useRef<Map<string, ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addLineSeries"]
  >>>(new Map());
  const seriesRef = useRef<ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addCandlestickSeries"]
  > | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addLineSeries"]
  >>>(new Map());
  const loadingMoreRef = useRef(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const rightMarginRef = useRef(rightMargin);
  /** メインチャート作成完了フラグ（オシレーターはメイン作成後に作るため、これで再実行を起こす） */
  const [mainChartReady, setMainChartReady] = useState(false);
  rightMarginRef.current = rightMargin;
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  /** 表示範囲を更新したときの replayTime。ユーザーがスクロール/ズームしたあとはここが変わるときだけ範囲を上書きする */
  const lastAppliedReplayTimeRef = useRef<number | null>(undefined);
  /** 前回 setData したときのバー数。loadMore で先頭に足が増えたときに復元範囲の論理インデックスをずらすために使う */
  const prevVisibleBarsLengthRef = useRef<number>(0);

  useImperativeHandle(
    ref,
    () => ({
      resize(width: number, height: number) {
        const ch = chartRef.current;
        const sub = oscillatorChartRef.current;
        if (sub) {
          const mainH = height - OSCILLATOR_PANE_HEIGHT;
          if (ch && mainH > 0) {
            ch.applyOptions({ width, height: mainH });
            ch.timeScale().applyOptions({
              rightOffset: rightMarginRef.current ? Math.max(10, Math.round((width * 0.2) / 6)) : 0,
            });
          }
          sub.applyOptions({ width, height: OSCILLATOR_PANE_HEIGHT });
        } else if (ch) {
          ch.applyOptions({ width, height });
          ch.timeScale().applyOptions({
            rightOffset: rightMarginRef.current ? Math.max(10, Math.round((width * 0.2) / 6)) : 0,
          });
        }
      },
    }),
    []
  );

  useEffect(() => {
    if (!chartContainerRef.current || typeof window === "undefined" || bars.length === 0) return;

    let cancelled = false;
    const replayTimeForInit = replayTime;

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
          // v4 は rightOffset（バー数）のみ。約1/5幅 ≒ (width*0.2)/barSpacing。barSpacing デフォルト 6
          rightOffset: rightMargin
            ? Math.max(10, Math.round((chartContainerRef.current.clientWidth * 0.2) / 6))
            : 0,
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
      setMainChartReady(true);

      const visibleBars = replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
      candlestickSeries.setData(visibleBars);
      prevVisibleBarsLengthRef.current = visibleBars.length;
      const timeScale = ch.timeScale();
      // 初回から右余白を効かせる（fitContent だけだと最新足が右端に張り付く）
      if (replayToIndex != null) {
        const from = Math.max(0, replayToIndex - REPLAY_VISIBLE_BARS);
        timeScale.setVisibleLogicalRange({ from, to: replayToIndex });
      } else {
        timeScale.fitContent();
      }
      // 2つ目の effect が「replayTime 未適用」と誤認して範囲を上書きしないよう、ここで記録する（作成は非同期のため effect は chart 未生成で return している）
      lastAppliedReplayTimeRef.current = replayTimeForInit ?? null;

      let initialFitDone = false;
      unsubRef.current = timeScale.subscribeVisibleLogicalRangeChange(async () => {
        const onLoadMoreFn = onLoadMoreRef.current;
        if (!onLoadMoreFn || loadingMoreRef.current || cancelled) return;
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
        setMainChartReady(false);
        resizeObserver.disconnect();
        unsubRef.current?.();
        window.removeEventListener("resize", handleResize);
        indicatorSeriesRef.current.forEach((s) => ch.removeSeries(s));
        indicatorSeriesRef.current.clear();
        ch.remove();
        chartRef.current = null;
        seriesRef.current = null;
        cleanupRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      setMainChartReady(false);
      cleanupRef.current?.();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [bars.length > 0, oscillatorSeries.length]);

  useEffect(() => {
    const series = seriesRef.current;
    const ch = chartRef.current;
    const container = chartContainerRef.current;
    if (!series || !ch || bars.length === 0) return;

    const timeScale = ch.timeScale();
    const shouldUpdateRange =
      replayTime === undefined ||
      replayTime === null ||
      replayTime !== lastAppliedReplayTimeRef.current;
    const savedRange = shouldUpdateRange ? null : timeScale.getVisibleLogicalRange();

    const visibleBars = replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
    series.setData(visibleBars);

    // エントリー＋決済マーカー（決済は逆ポジションの矢印で表示）
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
    series.setMarkers([...entryMarkerData, ...exitMarkerData]);

    // インジケータライン: 追加・更新・削除
    const currentKeys = new Set(indicatorSeries.map((s) => s.key));
    indicatorSeriesRef.current.forEach((lineSeries, key) => {
      if (!currentKeys.has(key)) {
        ch.removeSeries(lineSeries);
        indicatorSeriesRef.current.delete(key);
      }
    });
    indicatorSeries.forEach((ind) => {
      let lineSeries = indicatorSeriesRef.current.get(ind.key);
      if (!lineSeries) {
        lineSeries = ch.addLineSeries({
          color: ind.color,
          lineWidth: 2,
          priceScaleId: "right",
        });
        indicatorSeriesRef.current.set(ind.key, lineSeries);
      }
      lineSeries.setData(ind.data);
      lineSeries.applyOptions({ color: ind.color });
    });

    if (container && rightMargin) {
      timeScale.applyOptions({
        rightOffset: Math.max(10, Math.round((container.clientWidth * 0.2) / 6)),
      });
    } else if (container) {
      timeScale.applyOptions({ rightOffset: 0 });
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
      // loadMore で先頭に足が増えている場合、論理インデックスがずれるので同じ「見えている範囲」を維持するためにオフセットする
      const delta = visibleBars.length - prevVisibleBarsLengthRef.current;
      const rangeToRestore =
        delta > 0
          ? { from: savedRange.from + delta, to: savedRange.to + delta }
          : savedRange;
      timeScale.setVisibleLogicalRange(rangeToRestore);
    }
    prevVisibleBarsLengthRef.current = visibleBars.length;
  }, [bars, replayToIndex, replayTime, rightMargin, entryMarkers, exitMarkers, indicatorSeries]);

  const oscillatorCleanupRef = useRef<(() => void) | null>(null);

  // 下部オシレーターゾーン: RSI/Stoch 用の第2チャート（mainChartReady でメイン作成後に作成し一発で表示）
  useEffect(() => {
    if (
      oscillatorSeries.length === 0 ||
      !mainChartReady ||
      bars.length === 0
    ) {
      oscillatorCleanupRef.current?.();
      oscillatorCleanupRef.current = null;
      if (oscillatorChartRef.current) {
        oscillatorChartRef.current.remove();
        oscillatorChartRef.current = null;
        oscillatorSeriesRef.current.clear();
      }
      return;
    }
    if (!oscillatorContainerRef.current) return;
    if (oscillatorChartRef.current) return;

    const mainCh = chartRef.current;
    if (!mainCh) return;

    let cancelled = false;
    let timeScaleUnsub: (() => void) | null = null;
    void (async () => {
      const { createChart, ColorType } = await import("lightweight-charts");
      if (cancelled || !oscillatorContainerRef.current) return;

      const gridColor = "#e2e8f0";
      const sub = createChart(oscillatorContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#1e293b" },
        grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
        width: oscillatorContainerRef.current.clientWidth,
        height: OSCILLATOR_PANE_HEIGHT,
        timeScale: { timeVisible: true, secondsVisible: false, borderColor: gridColor },
        rightPriceScale: { borderColor: gridColor, scaleMargins: { top: 0.1, bottom: 0.1 } },
      });
      oscillatorChartRef.current = sub;

      oscillatorSeries.forEach((ind) => {
        const lineSeries = sub.addLineSeries({
          color: ind.color,
          lineWidth: 2,
          priceScaleId: "right",
        });
        lineSeries.setData(ind.data);
        oscillatorSeriesRef.current.set(ind.key, lineSeries);
      });

      const mainTimeScale = chartRef.current?.timeScale();
      if (mainTimeScale) {
        const syncRange = () => {
          if (oscillatorChartRef.current !== sub) return;
          try {
            const range = mainTimeScale.getVisibleLogicalRange();
            if (range) sub.timeScale().setVisibleLogicalRange(range);
          } catch {
            // メイン or サブが dispose 済みの場合は無視
          }
        };
        timeScaleUnsub = mainTimeScale.subscribeVisibleLogicalRangeChange(syncRange);
        syncRange();
      }

      const ro = new ResizeObserver(() => {
        if (cancelled || oscillatorChartRef.current !== sub) return;
        try {
          if (oscillatorContainerRef.current)
            sub.applyOptions({ width: oscillatorContainerRef.current.clientWidth, height: OSCILLATOR_PANE_HEIGHT });
        } catch {
          // dispose 済みなら無視
        }
      });
      ro.observe(oscillatorContainerRef.current);

      oscillatorCleanupRef.current = () => {
        timeScaleUnsub?.();
        timeScaleUnsub = null;
        ro.disconnect();
        try {
          sub.remove();
        } catch {
          // 既に dispose 済みの場合
        }
        oscillatorChartRef.current = null;
        oscillatorSeriesRef.current.clear();
        oscillatorCleanupRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      oscillatorCleanupRef.current?.();
    };
  }, [bars, oscillatorSeries, mainChartReady]);

  // oscillatorSeries のデータ更新時は既存のオシレーターチャートの系列だけ更新
  useEffect(() => {
    const sub = oscillatorChartRef.current;
    if (!sub || oscillatorSeries.length === 0) return;
    try {
      oscillatorSeries.forEach((ind) => {
        let lineSeries = oscillatorSeriesRef.current.get(ind.key);
        if (!lineSeries) {
          lineSeries = sub.addLineSeries({
            color: ind.color,
            lineWidth: 2,
            priceScaleId: "right",
          });
          oscillatorSeriesRef.current.set(ind.key, lineSeries);
        }
        lineSeries.setData(ind.data);
        lineSeries.applyOptions({ color: ind.color });
      });
      const currentKeys = new Set(oscillatorSeries.map((s) => s.key));
      oscillatorSeriesRef.current.forEach((lineSeries, key) => {
        if (!currentKeys.has(key)) {
          sub.removeSeries(lineSeries);
          oscillatorSeriesRef.current.delete(key);
        }
      });
    } catch {
      // チャートが dispose 済みの場合は無視（Object is disposed 防止）
    }
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

  if (oscillatorSeries.length > 0) {
    return (
      <div className={`flex flex-col ${className ?? ""}`.trim()}>
        <div ref={chartContainerRef} className="min-h-0 flex-1" />
        <div ref={oscillatorContainerRef} className="h-[120px] shrink-0" />
      </div>
    );
  }
  return <div ref={chartContainerRef} className={className} />;
});
