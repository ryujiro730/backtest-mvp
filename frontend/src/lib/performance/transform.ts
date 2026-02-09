// src/lib/performance/transform.ts

export type EquityRaw = {
  t: string; // "2000-05-30 17:00:00"
  e: number; // equity 倍率 or 残高
};

export type SummaryRaw = {
  pf: number;
  winrate: number;
  maxdd: number;
  trades: number;
};

export type TradeRaw = {
  entry_time: string;
  exit_time: string;
  entry: number;
  exit: number;
  pnl: number;
  /** バックエンドが返す "long" | "short"。未設定の場合は価格から推測（後方互換） */
  side?: "long" | "short";
};

export type PerformanceRaw = {
  equity: EquityRaw[];
  summary: SummaryRaw;
  trades: TradeRaw[];
};

// ===== 共通: 日付パース =====

function parseDate(s: string): Date {
  // "2000-05-30 17:00:00" → Date
  // タイムゾーン情報ないのでそのまま new Date() する
  // 必要なら "T" や "Z" を付けるのは後で調整すればOK
  return new Date(s.replace(" ", "T"));
}

// ===== 1) エクイティカーブ =====

export type EquityPoint = { date: string; equity: number };

export function buildEquitySeries(equity: EquityRaw[]): EquityPoint[] {
  return equity.map((p) => ({
    date: p.t, // ひとまず文字列そのまま。ラベル整形はチャート側でやってもOK
    equity: p.e,
  }));
}

// ===== 2) ドローダウン =====

export type DrawdownPoint = { date: string; dd: number };

export function buildDrawdownSeries(equity: EquityRaw[]): DrawdownPoint[] {
  let peak = -Infinity;
  return equity.map((p) => {
    if (p.e > peak) peak = p.e;
    const dd = peak === 0 || peak === -Infinity ? 0 : (p.e / peak - 1) * 100; // % 表示
    return {
      date: p.t,
      dd,
    };
  });
}

// ===== 3) 曜日別損益 =====

export type WeekdayPoint = { day: string; profit: number };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function buildWeekdaySeries(trades: TradeRaw[]): WeekdayPoint[] {
  if (!Array.isArray(trades)) return [];
  const agg = new Map<string, number>();

  for (const tr of trades) {
    const d = parseDate(tr.entry_time);
    const label = WEEKDAYS[d.getDay()];
    agg.set(label, (agg.get(label) ?? 0) + tr.pnl);
  }

  return WEEKDAYS.map((label) => ({
    day: label,
    profit: agg.get(label) ?? 0,
  }));
}

// ===== 4) 時間別パフォーマンス =====

export type HourlyPoint = { hour: number; profit: number };

export function buildHourlySeries(trades: TradeRaw[]): HourlyPoint[] {
  if (!Array.isArray(trades)) return [];
  const agg = new Map<number, number>();

  for (const tr of trades) {
    const d = parseDate(tr.entry_time);
    const h = d.getHours();
    agg.set(h, (agg.get(h) ?? 0) + tr.pnl);
  }

  const result: HourlyPoint[] = [];
  for (let h = 0; h < 24; h++) {
    result.push({ hour: h, profit: agg.get(h) ?? 0 });
  }
  return result;
}

// ===== 5) リターン分布（ヒストグラム） =====

export type ReturnBin = { range: string; count: number };

export function buildReturnHistogram(trades: TradeRaw[], binCount = 20): ReturnBin[] {
  if (!Array.isArray(trades) || trades.length === 0) return [];

  const values = trades.map((t) => t.pnl);
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === Infinity) min = 0;
  if (max === -Infinity) max = 0;

  if (min === max) {
    return [
      {
        range: `${min.toFixed(4)}`,
        count: trades.length,
      },
    ];
  }

  const step = (max - min) / binCount;
  const bins = new Array(binCount).fill(0);

  for (const v of values) {
    let idx = Math.floor((v - min) / step);
    if (idx === binCount) idx = binCount - 1;
    bins[idx]++;
  }

  const res: ReturnBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const start = min + step * i;
    const end = start + step;
    res.push({
      range: `${start.toFixed(4)} ~ ${end.toFixed(4)}`,
      count: bins[i],
    });
  }
  return res;
}

// ===== 6) 連敗ストリーク =====

export type StreakPoint = { streak: string; count: number };

export function buildLosingStreakSeries(trades: TradeRaw[]): StreakPoint[] {
  if (!Array.isArray(trades)) return [];
  // entry_time 順にソート（安全のため）
  const sorted = [...trades].sort(
    (a, b) => parseDate(a.entry_time).getTime() - parseDate(b.entry_time).getTime()
  );

  const streakCounts = new Map<number, number>();
  let current = 0;

  for (const tr of sorted) {
    if (tr.pnl < 0) {
      current += 1;
    } else {
      if (current > 0) {
        streakCounts.set(current, (streakCounts.get(current) ?? 0) + 1);
        current = 0;
      }
    }
  }
  if (current > 0) {
    streakCounts.set(current, (streakCounts.get(current) ?? 0) + 1);
  }

  // 小さい順でソート
  const entries = Array.from(streakCounts.entries()).sort((a, b) => a[0] - b[0]);

  return entries.map(([len, count]) => ({
    streak: `${len}x`,
    count,
  }));
}

// ===== 7) 保有時間 vs 損益（散布図） =====

export type DurationScatterPoint = {
  duration: number; // 分
  profit: number;
  result: "win" | "loss";
};

export function buildDurationScatter(trades: TradeRaw[]): DurationScatterPoint[] {
  if (!Array.isArray(trades)) return [];
  return trades.map((tr) => {
    const entry = parseDate(tr.entry_time);
    const exit = parseDate(tr.exit_time);
    const ms = exit.getTime() - entry.getTime();
    const minutes = ms / 1000 / 60;

    return {
      duration: minutes,
      profit: tr.pnl,
      result: tr.pnl >= 0 ? "win" : "loss",
    };
  });
}

export function buildTradeTypeEquitySeries(trades: TradeRaw[]) {
  if (!Array.isArray(trades)) return [];
  let long = 0;
  let short = 0;
  const result = [];

  for (const t of trades) {
    const pnl = Number(t.pnl ?? 0);

    const d = new Date(t.exit_time.replace(" ", "T"));
    if (isNaN(d.getTime())) continue;

    const date = d.toISOString().slice(0, 10);

    if (pnl >= 0) long += pnl;
    else short += pnl;

    result.push({
      date,
      long: Number(long.toFixed(4)),
      short: Number(short.toFixed(4)),
    });
  }

  return result;
}


export function buildTradeFrequency(trades: TradeRaw[] | unknown) {
  if (!Array.isArray(trades)) return {};
  const freq: Record<string, number> = {};

  for (const t of trades) {
    const d = new Date(t.entry_time.replace(" ", "T"));
    if (isNaN(d.getTime())) continue;

    const dayIndex = d.getDay();
    const day = ["日","月","火","水","木","金","土"][dayIndex];

    const hour = d.getHours();
    const band = `${Math.floor(hour / 3) * 3}-${Math.floor(hour / 3) * 3 + 3}`;

    const key = `${day}-${band}`;
    freq[key] = (freq[key] ?? 0) + 1;
  }

  return freq;
}
