import type { CandlestickBar } from "./ChartArea";

/** 時間足ごとの1本の秒数 */
export const TIMEFRAME_PERIOD_SEC: Record<string, number> = {
  M1: 60,
  M5: 300,
  M15: 900,
  M30: 1800,
  H1: 3600,
  H4: 14400,
  D1: 86400,
  W1: 604800,
};

/** タイムスタンプをその時間足の期間開始に切り下げ */
export function getPeriodStart(time: number, timeframe: string): number {
  const period = TIMEFRAME_PERIOD_SEC[timeframe];
  if (!period) return time;
  return Math.floor(time / period) * period;
}

/**
 * M1 の配列と再生ヘッド（現在の1分足タイムスタンプ）から、
 * 表示用時間足の「確定足」と「形成中足」を計算する。
 * 形成中足は replayHeadM1 までの M1 を集約した1本。
 */
export function aggregateM1ToTimeframe(
  m1Bars: CandlestickBar[],
  replayHeadM1: number,
  timeframe: string
): { completed: CandlestickBar[]; formingBar: CandlestickBar | null } {
  const period = TIMEFRAME_PERIOD_SEC[timeframe];
  if (!period || m1Bars.length === 0) {
    return { completed: [], formingBar: null };
  }

  const headPeriodStart = getPeriodStart(replayHeadM1, timeframe);
  const completed: CandlestickBar[] = [];
  let formingBar: CandlestickBar | null = null;

  // M1 は replayHeadM1 までしか使わない
  const usable = m1Bars.filter((b) => b.time <= replayHeadM1);
  if (usable.length === 0) return { completed, formingBar: null };

  const byPeriod = new Map<number, CandlestickBar[]>();
  for (const b of usable) {
    const start = getPeriodStart(b.time, timeframe);
    if (!byPeriod.has(start)) byPeriod.set(start, []);
    byPeriod.get(start)!.push(b);
  }

  const sortedStarts = Array.from(byPeriod.keys()).sort((a, b) => a - b);
  for (const start of sortedStarts) {
    const group = byPeriod.get(start)!;
    const isForming = start === headPeriodStart;
    const open = group[0].open;
    const high = Math.max(...group.map((b) => b.high));
    const low = Math.min(...group.map((b) => b.low));
    const close = group[group.length - 1].close;
    const bar: CandlestickBar = { time: start, open, high, low, close };
    if (isForming) formingBar = bar;
    else completed.push(bar);
  }

  return { completed, formingBar };
}

/** 表示用の全バー（確定足 + 形成中足）。形成中がなければ確定足だけ */
export function aggregatedBars(
  m1Bars: CandlestickBar[],
  replayHeadM1: number,
  timeframe: string
): CandlestickBar[] {
  const { completed, formingBar } = aggregateM1ToTimeframe(m1Bars, replayHeadM1, timeframe);
  return formingBar ? [...completed, formingBar] : completed;
}
