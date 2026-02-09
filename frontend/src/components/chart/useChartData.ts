"use client";

import { useState, useCallback, useEffect } from "react";
import type { CandlestickBar } from "./ChartArea";

const INITIAL_LIMIT = 2000;
const LOAD_MORE_LIMIT = 2000;

type ApiBar = CandlestickBar;

function toBars(rows: ApiBar[]): CandlestickBar[] {
  return rows.map((b) => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close }));
}

async function fetchBars(
  pair: string,
  timeframe: string,
  before?: number
): Promise<CandlestickBar[]> {
  const url = before
    ? `/api/chart-data?pair=${encodeURIComponent(pair)}&timeframe=${encodeURIComponent(timeframe)}&limit=${LOAD_MORE_LIMIT}&before=${before}`
    : `/api/chart-data?pair=${encodeURIComponent(pair)}&timeframe=${encodeURIComponent(timeframe)}&limit=${INITIAL_LIMIT}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const raw = await res.json();
  return toBars(Array.isArray(raw) ? raw : []);
}

export function useChartData(pair: string, timeframe: string) {
  const [bars, setBars] = useState<CandlestickBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reachedStart, setReachedStart] = useState(false);
  const loadingMoreRef = { current: false };

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReachedStart(false);
    setBars([]);
    try {
      const data = await fetchBars(pair, timeframe);
      setBars(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBars([]);
    } finally {
      setLoading(false);
    }
  }, [pair, timeframe]);

  const loadMore = useCallback(
    async (beforeTime: number) => {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      try {
        const older = await fetchBars(pair, timeframe, beforeTime);
        if (older.length === 0) {
          setReachedStart(true);
          return;
        }
        setBars((prev) => {
          const merged = [...older, ...prev].sort((a, b) => a.time - b.time);
          return merged.filter((b, i) => i === 0 || b.time !== merged[i - 1].time);
        });
      } finally {
        loadingMoreRef.current = false;
      }
    },
    [pair, timeframe]
  );

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return { bars, loading, error, reachedStart, loadMore };
}

/** リプレイ用: 指定範囲の M1 を取得（from〜to をカバーするまで繰り返し fetch） */
export function useChartDataM1ForRange(
  pair: string,
  range: { from: number; to: number } | null
) {
  const [m1Bars, setM1Bars] = useState<CandlestickBar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pair || !range || range.from >= range.to) {
      setM1Bars([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      const all: CandlestickBar[] = [];
      let before: number | undefined = range.to + 60;

      while (!cancelled) {
        const chunk = await fetchBars(pair, "M1", before);
        if (cancelled || chunk.length === 0) break;
        const merged = [...chunk, ...all].sort((a, b) => a.time - b.time);
        const deduped = merged.filter((b, i) => i === 0 || b.time !== merged[i - 1].time);
        all.length = 0;
        all.push(...deduped);
        const oldest = all[0]?.time ?? 0;
        if (oldest <= range.from) break;
        before = oldest;
        if (chunk.length < LOAD_MORE_LIMIT) break;
      }

      if (!cancelled) {
        const inRange = all.filter((b) => b.time >= range.from && b.time <= range.to);
        setM1Bars(inRange.sort((a, b) => a.time - b.time));
      }
      setLoading(false);
    };

    load().catch((e) => {
      if (!cancelled) {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pair, range?.from, range?.to]);

  return { m1Bars, loading, error };
}
