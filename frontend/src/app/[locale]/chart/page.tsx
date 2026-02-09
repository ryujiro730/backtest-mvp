"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Search,
  Rewind,
  Play,
  Square,
  FastForward,
  Ruler,
  Pencil,
  User,
  Plus,
  PanelRightOpen,
  PanelRightClose,
  X,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChartArea, type ChartAreaHandle } from "@/components/chart/ChartArea";
import { useChartData, useChartDataM1ForRange } from "@/components/chart/useChartData";
import {
  aggregatedBars,
  TIMEFRAME_PERIOD_SEC,
} from "@/components/chart/aggregateTimeframe";
import { useCatalog } from "@/features/run/hooks/useCatalog";
import {
  UNIQUE_INDICATOR_TYPES,
  computeIndicator,
  getDefById,
  getDefaultParamsForTypeId,
  getDefWithParams,
  type IndicatorParams,
} from "@/components/chart/indicators";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CandlestickBar } from "@/components/chart/ChartArea";
import type { TradeRaw } from "@/lib/performance/transform";

const TIMEFRAMES = [
  { label: "1m", value: "M1" },
  { label: "5m", value: "M5" },
  { label: "15m", value: "M15" },
  { label: "30m", value: "M30" },
  { label: "1H", value: "H1" },
  { label: "4H", value: "H4" },
  { label: "1D", value: "D1" },
  { label: "1W", value: "W1" },
] as const;

/** ユニークIDを生成。crypto.randomUUID が使えない環境（古い Android WebView 等）でも動作する */
function generateInstanceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const hex = "0123456789abcdef";
  let id = "";
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 16; i++) {
      id += hex[bytes[i]! >> 4] + hex[bytes[i]! & 15];
    }
  } else {
    for (let i = 0; i < 32; i++) {
      id += hex[Math.floor(Math.random() * 16)];
    }
  }
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-4${id.slice(12, 16)}-a${id.slice(16, 20)}-${id.slice(20, 32)}`;
}

const PLAY_INTERVAL_MS = 400;
/** M1 リプレイで 1 分進める間隔（ms）。小さくすると早送り */
const M1_REPLAY_INTERVAL_MS = 16;
/** M1 リプレイ：1 ステップで進める秒数（巻き戻し・早送り 1 回） */
const M1_STEP_SEC = 300;
/** M1 リプレイ：早送り/巻き戻し 10 本で進める秒数 */
const M1_FAST_STEP_SEC = 3000;
/** M1 を取得する表示足の本数上限（この本数分の範囲だけ M1 を取る） */
const M1_REPLAY_MAX_BARS = 90;
/** 長押しでセミオート開始までの遅延（ms） */
const LONG_PRESS_DELAY_MS = 400;
/** 長押し中の連続送り間隔（ms）。小さくすると巻き戻し早送りが速い */
const REPEAT_INTERVAL_MS = 24;

export type Position = {
  id: string;
  symbol: string;
  side: "Long" | "Short";
  quantity: number;
  entryTime: number;
  entryPrice: number;
  takeProfit: number | null;
  stopLoss: number | null;
  leverage: string;
};

/** 決済済み（TP/SL でクローズしたポジション） */
export type ClosedTrade = Position & { exitPrice: number; exitTime: number };

/** 1ロットあたりの契約サイズ（MT5/TradingView の標準。通貨単位の損益にする） */
const CONTRACT_SIZE = 100_000;

/** バックテストトレードの日時文字列を Unix 秒に */
function parseTradeTime(s: string): number {
  return Math.floor(new Date(s.replace(" ", "T")).getTime() / 1000);
}

function computeUnrealizedPnl(pos: Position, currentPrice: number): number {
  const diff = currentPrice - pos.entryPrice;
  const pnl = pos.side === "Long" ? diff * pos.quantity : -diff * pos.quantity;
  return Math.round(pnl * 100000) / 100000;
}

/** 未決済損益を金額（口座通貨）で。price diff × ロット数 × 契約サイズ */
function computeUnrealizedPnlMoney(pos: Position, currentPrice: number): number {
  const pnl = computeUnrealizedPnl(pos, currentPrice);
  return Math.round(pnl * CONTRACT_SIZE * 100) / 100;
}

function computeRealizedPnl(pos: Position, exitPrice: number): number {
  const diff = exitPrice - pos.entryPrice;
  const pnl = pos.side === "Long" ? diff * pos.quantity : -diff * pos.quantity;
  return Math.round(pnl * 100000) / 100000;
}

/** 決済損益を金額（口座通貨）で */
function computeRealizedPnlMoney(pos: Position, exitPrice: number): number {
  const pnl = computeRealizedPnl(pos, exitPrice);
  return Math.round(pnl * CONTRACT_SIZE * 100) / 100;
}

/** その足で TP または SL に当たったか判定。当たった場合 { exitPrice } を返す。同一足で両方当たる場合は TP 優先 */
function checkTpSlHit(
  pos: Position,
  bar: { high: number; low: number }
): { exitPrice: number } | null {
  if (pos.side === "Long") {
    if (pos.takeProfit != null && bar.high >= pos.takeProfit)
      return { exitPrice: pos.takeProfit };
    if (pos.stopLoss != null && bar.low <= pos.stopLoss) return { exitPrice: pos.stopLoss };
  } else {
    if (pos.takeProfit != null && bar.low <= pos.takeProfit)
      return { exitPrice: pos.takeProfit };
    if (pos.stopLoss != null && bar.high >= pos.stopLoss) return { exitPrice: pos.stopLoss };
  }
  return null;
}

function ChartPageInner() {
  const t = useTranslations("Chart");
  const locale = useLocale();
  const { catalog, hasCatalog } = useCatalog();
  const searchParams = useSearchParams();
  const runIdFromUrl = searchParams.get("runId");
  const urlSymbol = searchParams.get("symbol");
  const urlTimeframe = searchParams.get("timeframe");

  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [runTrades, setRunTrades] = useState<TradeRaw[] | null>(null);

  /** URL で runId + symbol + timeframe が渡されたとき、銘柄・時間足を合わせてトレード取得 */
  useEffect(() => {
    if (!runIdFromUrl) {
      setRunTrades(null);
      return;
    }
    if (urlSymbol) setSymbol(urlSymbol);
    if (urlTimeframe) setTimeframe(urlTimeframe);
    fetch(`/api/reports/${runIdFromUrl}/trades`, { cache: "no-store" })
      .then((r) => r.json())
      .then((t) => setRunTrades(Array.isArray(t) ? t : Array.isArray(t?.trades) ? t.trades : []))
      .catch(() => setRunTrades([]));
  }, [runIdFromUrl, urlSymbol, urlTimeframe]);

  const { bars: barsFromApi, loading, error, reachedStart, loadMore } = useChartData(symbol, timeframe);

  /** M1 リプレイ用: 表示足の範囲（直近 M1_REPLAY_MAX_BARS 本） */
  const m1Range = useMemo(() => {
    if (timeframe === "M1" || barsFromApi.length === 0) return null;
    const period = TIMEFRAME_PERIOD_SEC[timeframe];
    if (!period) return null;
    const fromIdx = Math.max(0, barsFromApi.length - M1_REPLAY_MAX_BARS);
    const from = barsFromApi[fromIdx].time;
    const to = barsFromApi[barsFromApi.length - 1].time + period;
    return { from, to };
  }, [timeframe, barsFromApi]);

  const { m1Bars, loading: m1Loading } = useChartDataM1ForRange(symbol, m1Range);

  /** 再生ヘッド（M1 のタイムスタンプ）。M1 リプレイ時は 1 分単位で進める */
  const [replayHeadM1, setReplayHeadM1] = useState<number | null>(null);

  /** M1 リプレイが有効か（表示足が M1 以外かつ M1 データが揃っている） */
  const useM1Replay = timeframe !== "M1" && m1Bars.length > 0 && m1Range != null;

  /** 表示用バー: M1 リプレイ時。再生ヘッドが M1 範囲外（前）のときは API の全本、範囲内なら prefix＋集約 */
  const bars = useMemo(() => {
    if (!useM1Replay || replayHeadM1 == null || !m1Range) return barsFromApi;
    if (replayHeadM1 < m1Range.from) return barsFromApi;
    const fromIdx = Math.max(0, barsFromApi.length - M1_REPLAY_MAX_BARS);
    const prefixBars = barsFromApi.slice(0, fromIdx);
    const m1Aggregated = aggregatedBars(m1Bars, Math.min(replayHeadM1, m1Range.to), timeframe);
    return [...prefixBars, ...m1Aggregated];
  }, [useM1Replay, barsFromApi, m1Bars, replayHeadM1, timeframe, m1Range]);

  /** M1 が揃ったとき再生ヘッドを範囲の末尾に初期化（確定足まで表示）。巻き戻し→再生で形成アニメ */
  useEffect(() => {
    if (!useM1Replay || !m1Range) return;
    setReplayHeadM1((prev) => {
      if (prev != null && prev >= m1Range.from && prev <= m1Range.to) return prev;
      return m1Range.to;
    });
  }, [useM1Replay, m1Range]);

  /** API の銘柄一覧が取れたら、現在値が一覧に含まれていなければ先頭に合わせる（runId で開いたときは URL の銘柄を優先） */
  useEffect(() => {
    if (runIdFromUrl && urlSymbol) return;
    if (catalog.pairs.length > 0) {
      setSymbol((prev) => (catalog.pairs.includes(prev) ? prev : catalog.pairs[0]));
    }
  }, [catalog.pairs, runIdFromUrl, urlSymbol]);

  /** 再生位置は「現在の足の時刻」で保持。loadMore で先頭に足が追加されても同じ足を指す */
  const [replayTime, setReplayTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  /** TradingView リプレイ風: ON のときチャートの足をクリックするとその位置までスキップ */
  const [skipReplayMode, setSkipReplayMode] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  /** TP/SL で決済した履歴（巻き戻しで復元するため exitTime で紐付け） */
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const prevBarIndexRef = useRef<number | null>(null);
  const replayInitializedRef = useRef(false);
  const positionsRef = useRef(positions);
  const closedTradesRef = useRef(closedTrades);
  const barsRef = useRef(bars);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  positionsRef.current = positions;
  closedTradesRef.current = closedTrades;
  barsRef.current = bars;

  const clearHoldRepeat = useCallback(() => {
    if (holdTimeoutRef.current != null) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current != null) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  const currentBarIndex = useMemo(() => {
    if (bars.length === 0) return 0;
    if (useM1Replay && replayHeadM1 != null && m1Range) {
      if (replayHeadM1 < m1Range.from) {
        const idx = barsFromApi.findLastIndex((b) => b.time <= replayHeadM1);
        return idx >= 0 ? idx : 0;
      }
      return bars.length - 1;
    }
    if (replayTime == null) return bars.length - 1;
    const i = bars.findIndex((b) => b.time === replayTime);
    if (i >= 0) return i;
    const lastBefore = bars.findLastIndex((b) => b.time <= replayTime);
    return lastBefore >= 0 ? lastBefore : 0;
  }, [bars, barsFromApi, replayTime, useM1Replay, replayHeadM1, m1Range]);

  /** 右余白（MT5風）ON/OFF */
  const [rightMargin, setRightMargin] = useState(true);

  /** ヘッダータブ（Indicators/Rules はクリックでダイアログ開く） */
  const [headerTab, setHeaderTab] = useState<"indicators" | "rules" | "mode">("indicators");

  const rootRef = useRef<HTMLDivElement>(null);
  const headerTabsRef = useRef<HTMLDivElement>(null);
  const noTabFocusUntilRef = useRef(0);
  /** 初期表示でヘッダのタブにフォーカスが当たらないようにする（Indicators をクリックせずにダイアログを開けるように） */
  useEffect(() => {
    noTabFocusUntilRef.current = Date.now() + 1200;
    const t1 = setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 50);
    const t2 = setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 200);
    const t3 = setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 500);
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Node;
      if (Date.now() < noTabFocusUntilRef.current && headerTabsRef.current?.contains(target)) {
        rootRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("focusin", onFocusIn);
    const t4 = setTimeout(() => document.removeEventListener("focusin", onFocusIn), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);
  /** 環境設定（証拠金・スプレッド等） */
  const [envBalance, setEnvBalance] = useState("10000");
  const [envSpread, setEnvSpread] = useState("1");
  const [envLeverage, setEnvLeverage] = useState("100");
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [indicatorsDialogOpen, setIndicatorsDialogOpen] = useState(false);
  /** チャートに追加されたインジケータのインスタンス（Indicators タブで追加・左上クリックで設定） */
  type IndicatorInstance = { instanceId: string; typeId: string; params: IndicatorParams; color?: string };
  const [indicatorInstances, setIndicatorInstances] = useState<IndicatorInstance[]>([]);
  /** 左上ラベルクリックで開く設定モーダル用の instanceId */
  const [indicatorSettingsInstanceId, setIndicatorSettingsInstanceId] = useState<string | null>(null);
  /** 設定モーダル内の編集用（パラメーター・色・可視性） */
  const [indicatorEditParams, setIndicatorEditParams] = useState<IndicatorParams>({ enabled: true, period: 14 });
  const [indicatorEditColor, setIndicatorEditColor] = useState("#6366f1");
  const [indicatorSettingsTab, setIndicatorSettingsTab] = useState<"params" | "style" | "visibility">("params");

  /** 設定モーダルを開いたときに編集用 state をインスタンスで初期化 */
  useEffect(() => {
    if (indicatorSettingsInstanceId == null) return;
    const inst = indicatorInstances.find((i) => i.instanceId === indicatorSettingsInstanceId);
    const firstDef = inst
      ? getDefById(UNIQUE_INDICATOR_TYPES.find((t) => t.id === inst.typeId)?.defIds[0] ?? "")
      : undefined;
    if (inst) {
      setIndicatorEditParams(inst.params);
      setIndicatorEditColor(inst.color ?? firstDef?.color ?? "#6366f1");
      setIndicatorSettingsTab("params");
    }
  }, [indicatorSettingsInstanceId, indicatorInstances]);

  const [entryOpen, setEntryOpen] = useState(false);
  const [entrySide, setEntrySide] = useState<"Long" | "Short">("Long");
  const [entryQty, setEntryQty] = useState("1");
  const [entryTp, setEntryTp] = useState("");
  const [entrySl, setEntrySl] = useState("");
  /** クイックエントリー用ロット（ボタン間で編集、押下で即約定） */
  const [quickEntryQty, setQuickEntryQty] = useState("1");
  /** 下パネル（Position/Order History）の高さ（px）。リサイズハンドルで変更可能 */
  const [panelHeightPx, setPanelHeightPx] = useState(220);
  /** バックテスト run のエントリー・決済マーカーを非表示にするか（ボタンで切り替え） */
  const [hideRunMarkers, setHideRunMarkers] = useState(false);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<ChartAreaHandle>(null);
  const resizeStartYRef = useRef(0);
  const resizeStartHeightRef = useRef(0);

  const replayToIndex = bars.length > 0 ? currentBarIndex : null;
  const currentBar: CandlestickBar | null =
    bars.length > 0 && currentBarIndex >= 0 && currentBarIndex < bars.length
      ? bars[currentBarIndex]
      : null;
  const currentPrice = currentBar?.close ?? 0;

  useEffect(() => {
    replayInitializedRef.current = false;
    setReplayTime(null);
    setReplayHeadM1(null);
    setPositions([]);
    setClosedTrades([]);
  }, [symbol, timeframe]);

  useEffect(() => {
    if (bars.length > 0 && !replayInitializedRef.current && !useM1Replay) {
      replayInitializedRef.current = true;
      setReplayTime(bars[bars.length - 1].time);
    }
    if (useM1Replay) replayInitializedRef.current = true;
  }, [bars, useM1Replay]);

  /** 足が進んだとき TP/SL 判定で約定、巻き戻したとき約定取り消し */
  useEffect(() => {
    if (bars.length === 0) return;
    const prev = prevBarIndexRef.current;
    prevBarIndexRef.current = currentBarIndex;

    if (prev === null) return; // 初回はスキップ

    if (currentBarIndex > prev) {
      // 再生が進んだ: 現在の足で TP/SL ヒットしたポジションを決済
      const bar = bars[currentBarIndex];
      const openPositions = positionsRef.current;
      const toClose: Position[] = [];
      const stillOpen: Position[] = [];
      for (const pos of openPositions) {
        if (pos.entryTime >= bar.time) {
          stillOpen.push(pos);
          continue;
        }
        const hit = checkTpSlHit(pos, bar);
        if (hit) toClose.push(pos);
        else stillOpen.push(pos);
      }
      if (toClose.length > 0) {
        const newClosed: ClosedTrade[] = toClose.map((pos) => {
          const hit = checkTpSlHit(pos, bar)!;
          return { ...pos, exitPrice: hit.exitPrice, exitTime: bar.time };
        });
        setPositions(stillOpen);
        setClosedTrades((prevClosed) => [...prevClosed, ...newClosed]);
      }
    } else if (currentBarIndex < prev) {
      // 巻き戻し: 戻った先の「次の足」で決済したものをポジションに戻す
      const barWeLeft = bars[prev];
      const prevClosed = closedTradesRef.current;
      const toReopen = prevClosed.filter((t) => t.exitTime === barWeLeft.time);
      if (toReopen.length > 0) {
        const openAgain: Position[] = toReopen.map((t) => ({
          id: t.id,
          symbol: t.symbol,
          side: t.side,
          quantity: t.quantity,
          entryTime: t.entryTime,
          entryPrice: t.entryPrice,
          takeProfit: t.takeProfit,
          stopLoss: t.stopLoss,
          leverage: t.leverage,
        }));
        setPositions((p) => [...p, ...openAgain]);
        setClosedTrades((c) => c.filter((t) => t.exitTime !== barWeLeft.time));
      }
    }
  }, [currentBarIndex, bars]);

  useEffect(() => {
    if (!isPlaying) return;

    if (useM1Replay && m1Range) {
      const id = setInterval(() => {
        setReplayHeadM1((prev) => {
          if (prev == null) return m1Range.from;
          const next = prev + 60;
          if (next > m1Range.to) {
            setIsPlaying(false);
            return m1Range.to;
          }
          return next;
        });
      }, M1_REPLAY_INTERVAL_MS);
      return () => clearInterval(id);
    }

    if (bars.length === 0) return;
    const id = setInterval(() => {
      setReplayTime((t) => {
        const b = barsRef.current;
        if (b.length === 0) return t;
        const idx =
          t == null ? b.length - 1 : b.findIndex((bar) => bar.time === t);
        if (idx < 0 || idx >= b.length - 1) {
          setIsPlaying(false);
          return t ?? b[b.length - 1].time;
        }
        return b[idx + 1].time;
      });
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPlaying, bars.length, useM1Replay, m1Range]);

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    if (useM1Replay && m1Range) {
      const minHead = barsFromApi.length > 0 ? barsFromApi[0].time : m1Range.from;
      setReplayHeadM1((prev) => (prev != null ? Math.max(minHead, prev - M1_STEP_SEC) : m1Range.from));
      return;
    }
    if (bars.length === 0) return;
    setReplayTime((t) => {
      const idx =
        t == null ? bars.length - 1 : bars.findIndex((b) => b.time === t);
      const prev = Math.max(0, idx - 1);
      return bars[prev].time;
    });
  }, [bars, barsFromApi, useM1Replay, m1Range]);
  const handleForward = useCallback(() => {
    if (useM1Replay && m1Range) {
      setReplayHeadM1((prev) => (prev != null ? Math.min(m1Range.to, prev + M1_STEP_SEC) : m1Range.from));
      return;
    }
    if (bars.length === 0) return;
    setReplayTime((t) => {
      const idx =
        t == null ? bars.length - 1 : bars.findIndex((b) => b.time === t);
      const next = Math.min(bars.length - 1, idx + 1);
      return bars[next].time;
    });
  }, [bars, useM1Replay, m1Range]);
  const handleRewindFast = useCallback(() => {
    setIsPlaying(false);
    if (useM1Replay && m1Range) {
      const minHead = barsFromApi.length > 0 ? barsFromApi[0].time : m1Range.from;
      setReplayHeadM1((prev) => (prev != null ? Math.max(minHead, prev - M1_FAST_STEP_SEC) : m1Range.from));
      return;
    }
    if (bars.length === 0) return;
    setReplayTime((t) => {
      const idx =
        t == null ? bars.length - 1 : bars.findIndex((b) => b.time === t);
      const prev = Math.max(0, idx - 10);
      return bars[prev].time;
    });
  }, [bars, barsFromApi, useM1Replay, m1Range]);
  const handleForwardFast = useCallback(() => {
    if (useM1Replay && m1Range) {
      setReplayHeadM1((prev) => (prev != null ? Math.min(m1Range.to, prev + M1_FAST_STEP_SEC) : m1Range.from));
      return;
    }
    if (bars.length === 0) return;
    setReplayTime((t) => {
      const idx =
        t == null ? bars.length - 1 : bars.findIndex((b) => b.time === t);
      const next = Math.min(bars.length - 1, idx + 10);
      return bars[next].time;
    });
  }, [bars, useM1Replay, m1Range]);

  /** リプレイ地点選択: クリックした足をリプレイ先頭にし、その足および左側だけ表示（未来を消す）。選択後はモードを自動OFF */
  const handleBarClickForSkip = useCallback(
    (barIndex: number) => {
      if (bars.length === 0 || barIndex < 0 || barIndex >= bars.length) return;
      const barTime = bars[barIndex]!.time;
      setReplayTime(barTime);
      setIsPlaying(false);
      setSkipReplayMode(false);
      if (useM1Replay) {
        setReplayHeadM1(barTime);
      }
    },
    [bars, useM1Replay]
  );

  const startHoldRepeat = useCallback(
    (handler: () => void) => {
      clearHoldRepeat();
      handler();
      holdTimeoutRef.current = setTimeout(() => {
        holdTimeoutRef.current = null;
        holdIntervalRef.current = setInterval(handler, REPEAT_INTERVAL_MS);
      }, LONG_PRESS_DELAY_MS);
    },
    [clearHoldRepeat]
  );

  useEffect(() => () => clearHoldRepeat(), [clearHoldRepeat]);

  const onLoadMore = useCallback(async () => {
    const oldest = (useM1Replay ? barsFromApi[0] : bars[0])?.time;
    if (oldest != null && !reachedStart) await loadMore(oldest);
  }, [bars, barsFromApi, reachedStart, loadMore, useM1Replay]);

  const MIN_PANEL_HEIGHT = 120;
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartYRef.current = e.clientY;
    resizeStartHeightRef.current = panelHeightPx;
    const onMove = (e: MouseEvent) => {
      const wrapper = contentWrapperRef.current;
      if (!wrapper) return;
      const delta = resizeStartYRef.current - e.clientY;
      const next = resizeStartHeightRef.current + delta;
      const max = Math.max(MIN_PANEL_HEIGHT, wrapper.clientHeight - 150);
      const nextClamped = Math.min(max, Math.max(MIN_PANEL_HEIGHT, next));
      setPanelHeightPx(nextClamped);
      chartAreaRef.current?.resize(wrapper.clientWidth, wrapper.clientHeight - nextClamped);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [panelHeightPx]);

  const handleAddPosition = useCallback(() => {
    if (!currentBar) return;
    const qty = parseInt(entryQty, 10) || 1;
    const parseNum = (s: string) => {
      const v = parseFloat(s);
      return s.trim() !== "" && !Number.isNaN(v) ? v : null;
    };
    const tp = parseNum(entryTp);
    const sl = parseNum(entrySl);
    setPositions((prev) => [
      ...prev,
      {
        id: `pos-${Date.now()}`,
        symbol,
        side: entrySide,
        quantity: qty,
        entryTime: currentBar.time,
        entryPrice: currentBar.close,
        takeProfit: tp,
        stopLoss: sl,
        leverage: `${envLeverage}x`,
      },
    ]);
    setEntryOpen(false);
    setEntryQty("1");
    setEntryTp("");
    setEntrySl("");
  }, [currentBar, symbol, entrySide, entryQty, entryTp, entrySl, envLeverage]);

  /** クイックエントリー: モーダルを開かず現在価格で即約定（ロットは quickEntryQty） */
  const handleQuickEntry = useCallback(
    (side: "Long" | "Short") => {
      if (!currentBar || currentPrice <= 0) return;
      const qty = Math.max(0.01, parseFloat(quickEntryQty) || 1);
      setPositions((prev) => [
        ...prev,
        {
          id: `pos-${Date.now()}`,
          symbol,
          side,
          quantity: qty,
          entryTime: currentBar.time,
          entryPrice: currentPrice,
          takeProfit: null,
          stopLoss: null,
          leverage: `${envLeverage}x`,
        },
      ]);
    },
    [currentBar, currentPrice, symbol, quickEntryQty, envLeverage]
  );

  /** 再生位置時点で有効なポジション（オープン中のものだけ） */
  const visiblePositions = positions.filter(
    (p) => currentBar && p.entryTime <= currentBar.time
  );
  /** 未決済 P&L 合計（金額・口座通貨）。再生で変動 */
  const unrealizedSumMoney = visiblePositions.reduce(
    (acc, p) => acc + computeUnrealizedPnlMoney(p, currentPrice),
    0
  );
  /** 資産残高＝初期証拠金＋決済済み損益（再生位置時点まで）。決済ごとに変動 */
  const balance =
    (parseFloat(envBalance) || 0) +
    (currentBar
      ? closedTrades
          .filter((t) => t.exitTime <= currentBar.time)
          .reduce((s, t) => s + computeRealizedPnlMoney(t, t.exitPrice), 0)
      : 0);
  /** トレードの向き: API の side を優先し、無い場合は価格で推測（後方互換） */
  const tradeSide = useCallback((t: TradeRaw): "Long" | "Short" => {
    if (t.side === "long") return "Long";
    if (t.side === "short") return "Short";
    return (t.entry < t.exit ? "Long" : "Short") as "Long" | "Short";
  }, []);
  /** バックテスト run のトレードからエントリー・決済マーカー（runId で開いたとき用） */
  const runEntryMarkers = useMemo((): { time: number; side: "Long" | "Short" }[] => {
    if (!runTrades || runTrades.length === 0) return [];
    return runTrades.map((t) => ({
      time: parseTradeTime(t.entry_time),
      side: tradeSide(t),
    }));
  }, [runTrades, tradeSide]);
  const runExitMarkers = useMemo((): { time: number; side: "Long" | "Short" }[] => {
    if (!runTrades || runTrades.length === 0) return [];
    return runTrades.map((t) => ({
      time: parseTradeTime(t.exit_time),
      side: tradeSide(t) === "Long" ? "Short" : "Long",
    }));
  }, [runTrades, tradeSide]);

  /** エントリーマーカー用: run 表示時は run のトレード（非表示オプションあり）、それ以外はオープン＋決済済み */
  const entryMarkersList = useMemo(() => {
    if (runTrades && runTrades.length > 0) {
      if (hideRunMarkers) return [];
      return runEntryMarkers;
    }
    const all = [...positions, ...closedTrades];
    return currentBar
      ? all
          .filter((p) => p.entryTime <= currentBar.time)
          .map((p) => ({ time: p.entryTime, side: p.side }))
      : [];
  }, [runTrades, runEntryMarkers, hideRunMarkers, positions, closedTrades, currentBar]);
  /** 価格軸オーバーレイ用・下部オシレーター用に振り分けたインジケータ系列（インスタンスから展開） */
  const { overlaySeries, oscillatorSeries } = useMemo(() => {
    const visibleBars =
      replayToIndex != null ? bars.slice(0, replayToIndex + 1) : bars;
    const overlay: { key: string; data: { time: number; value: number }[]; color: string }[] = [];
    const oscillator: { key: string; data: { time: number; value: number }[]; color: string }[] = [];
    if (visibleBars.length === 0) return { overlaySeries: overlay, oscillatorSeries: oscillator };
    indicatorInstances.forEach((inst) => {
      if (!inst.params.enabled) return;
      const typeInfo = UNIQUE_INDICATOR_TYPES.find((t) => t.id === inst.typeId);
      if (!typeInfo) return;
      typeInfo.defIds.forEach((defId) => {
        const def = getDefById(defId);
        if (!def) return;
        const merged = getDefWithParams(def, inst.params);
        const data = computeIndicator(visibleBars, merged);
        const color = inst.color ?? def.color;
        const item = { key: `${inst.instanceId}-${defId}`, data, color };
        if (def.scale === "price") overlay.push(item);
        else oscillator.push(item);
      });
    });
    return { overlaySeries: overlay, oscillatorSeries: oscillator };
  }, [bars, replayToIndex, indicatorInstances]);

  /** 決済マーカー: run 表示時は run の決済（非表示オプションあり）、それ以外は手動決済履歴 */
  const exitMarkersList = useMemo((): { time: number; side: "Long" | "Short" }[] => {
    if (runTrades && runTrades.length > 0) {
      if (hideRunMarkers) return [];
      return runExitMarkers;
    }
    return currentBar
      ? closedTrades
          .filter((t) => t.exitTime <= currentBar.time)
          .map((t) => ({
            time: t.exitTime,
            side: (t.side === "Long" ? "Short" : "Long") as "Long" | "Short",
          }))
      : [];
  }, [runTrades, runExitMarkers, hideRunMarkers, closedTrades, currentBar]);

  /** 手動決済: 現在価格でクローズして約定履歴へ */
  const handleClosePosition = useCallback(
    (posId: string) => {
      if (!currentBar || currentPrice <= 0) return;
      const pos = positions.find((p) => p.id === posId);
      if (!pos) return;
      setPositions((prev) => prev.filter((p) => p.id !== posId));
      setClosedTrades((prev) => [
        ...prev,
        { ...pos, exitPrice: currentPrice, exitTime: currentBar.time },
      ]);
    },
    [currentBar, currentPrice, positions]
  );

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="flex h-screen w-full flex-col overflow-hidden bg-background outline-none"
    >
      <header className="flex shrink-0 flex-col gap-2 border-b px-3 py-2 sm:gap-0 sm:px-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {searchParams.get("from") === "performance" && (
              <Link
                href={`/${locale}/performance`}
                className="shrink-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground"
              >
                {t("backToPerformance")}
              </Link>
            )}
            <Link
              href={`/${locale}`}
              className="shrink-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              {t("backToBacktest")}
            </Link>
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select
              value={symbol}
              onValueChange={(v) => setSymbol(v)}
              disabled={!hasCatalog}
            >
              <SelectTrigger className="w-[5.5rem] font-mono sm:w-28">
                <SelectValue placeholder={hasCatalog ? t("symbolPlaceholder") : t("symbolLoading")} />
              </SelectTrigger>
              <SelectContent>
                {(catalog.pairs.length > 0 ? catalog.pairs : ["EURUSD"]).map((p: string) => (
                  <SelectItem key={p} value={p} className="font-mono">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div ref={headerTabsRef}>
            <Tabs
              value={indicatorsDialogOpen ? "indicators" : rulesDialogOpen ? "rules" : headerTab}
              onValueChange={(v) => {
                if (v === "indicators") setIndicatorsDialogOpen(true);
                else if (v === "rules") setRulesDialogOpen(true);
                else setHeaderTab(v as "indicators" | "rules" | "mode");
              }}
              className="shrink-0"
            >
              <TabsList className="h-8">
                <TabsTrigger value="indicators" className="text-xs">
                  {t("tabs.indicators")}
                </TabsTrigger>
                <TabsTrigger value="rules" className="text-xs">
                  {t("tabs.rules")}
                </TabsTrigger>
                <TabsTrigger value="mode" className="text-xs">
                  {t("tabs.mode")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex shrink-0 gap-0 sm:gap-1">
            <Button
              variant={rightMargin ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              title={rightMargin ? t("rightMarginOn") : t("rightMarginOff")}
              onClick={() => setRightMargin((m) => !m)}
            >
              {rightMargin ? (
                <PanelRightOpen className="h-4 w-4" />
              ) : (
                <PanelRightClose className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex" title={t("ruler")}>
              <Ruler className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex" title={t("draw")}>
              <Pencil className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{t("account")}</DropdownMenuItem>
                <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={t("rewindFast")}
            onClick={handleRewindFast}
            onPointerDown={() => bars.length > 0 && startHoldRepeat(handleRewindFast)}
            onPointerUp={clearHoldRepeat}
            onPointerLeave={clearHoldRepeat}
            disabled={bars.length === 0}
          >
            <Rewind className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={t("rewindOne")}
            onClick={handleRewind}
            onPointerDown={() => bars.length > 0 && startHoldRepeat(handleRewind)}
            onPointerUp={clearHoldRepeat}
            onPointerLeave={clearHoldRepeat}
            disabled={bars.length === 0}
          >
            <Rewind className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={isPlaying ? t("pause") : t("play")}
            onClick={() => setIsPlaying((p) => !p)}
            disabled={bars.length === 0}
          >
            <Play className={cn("h-4 w-4", isPlaying && "text-primary")} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={t("stop")}
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={skipReplayMode ? "secondary" : "outline"}
            size="icon"
            className="h-8 w-8 shrink-0"
            title={t("skipReplayModeTitle")}
            onClick={() => setSkipReplayMode((v) => !v)}
            disabled={bars.length === 0}
          >
            <Scissors className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={t("forwardOne")}
            onClick={handleForward}
            onPointerDown={() => bars.length > 0 && startHoldRepeat(handleForward)}
            onPointerUp={clearHoldRepeat}
            onPointerLeave={clearHoldRepeat}
            disabled={bars.length === 0}
          >
            <FastForward className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            title={t("forwardFast")}
            onClick={handleForwardFast}
            onPointerDown={() => bars.length > 0 && startHoldRepeat(handleForwardFast)}
            onPointerUp={clearHoldRepeat}
            onPointerLeave={clearHoldRepeat}
            disabled={bars.length === 0}
          >
            <FastForward className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-1 border-b px-2 py-1.5 sm:justify-start sm:px-4">
        {TIMEFRAMES.map(({ label, value }) => (
          <Button
            key={value}
            variant={timeframe === value ? "secondary" : "ghost"}
            size="sm"
            className="h-7 shrink-0 px-2 text-xs font-mono"
            onClick={() => setTimeframe(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* メイン領域：スプリットビューのコンテナ */}
      <div
        ref={contentWrapperRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        {/* チャート：flex-1 で残りの高さ全部を自動占有 */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t("loading")}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-destructive">
              {error}
            </div>
          ) : bars.length > 0 ? (
            <>
              <div
                className={cn(
                  "relative h-full min-h-0 w-full overflow-hidden",
                  skipReplayMode && "cursor-crosshair"
                )}
              >
                <ChartArea
                  ref={chartAreaRef}
                  bars={bars}
                  replayToIndex={replayToIndex}
                  replayTime={replayTime}
                  rightMargin={rightMargin}
                  entryMarkers={entryMarkersList}
                  exitMarkers={exitMarkersList}
                  indicatorSeries={overlaySeries}
                  oscillatorSeries={oscillatorSeries}
                  onLoadMore={onLoadMore}
                  onBarClick={skipReplayMode ? handleBarClickForSkip : undefined}
                  className="h-full w-full"
                />
              </div>
              {/* チャート左上: 縦積みで重ならない順 → クイックエントリー → インジケータ表示 → マーカーを消す */}
              <div className="absolute left-2 top-2 z-10 flex flex-col gap-3 sm:left-4 sm:top-4">
                {/* 1. クイックエントリー */}
                {currentPrice > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickEntry("Short")}
                      className="flex flex-col rounded-md border-2 border-red-500 bg-white px-2 py-1.5 text-left shadow-[0_2px_0_0_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-all hover:brightness-[0.98] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.06),inset_0_2px_2px_rgba(0,0,0,0.08)] sm:rounded-lg sm:px-4 sm:py-2.5 sm:shadow-[0_3px_0_0_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] sm:active:translate-y-[2px] sm:active:shadow-[0_1px_0_0_rgba(0,0,0,0.06),inset_0_2px_3px_rgba(0,0,0,0.08)]"
                      title={t("quickShort")}
                    >
                      <span className="text-sm font-semibold tabular-nums text-red-600 sm:text-lg">
                        {currentPrice.toFixed(5)}
                      </span>
                      <span className="text-xs font-medium text-red-600 sm:text-sm">{t("sell")}</span>
                    </button>
                    <div className="flex flex-col items-center gap-0.5">
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={quickEntryQty}
                        onChange={(e) => setQuickEntryQty(e.target.value)}
                        className="h-8 w-14 border border-input bg-background px-1 text-center text-sm font-mono tabular-nums sm:w-16"
                        title={t("lotTitle")}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-[10px] text-muted-foreground">{t("lot")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickEntry("Long")}
                      className="flex flex-col rounded-md border-2 border-blue-500 bg-white px-2 py-1.5 text-left shadow-[0_2px_0_0_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-all hover:brightness-[0.98] active:translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.06),inset_0_2px_2px_rgba(0,0,0,0.08)] sm:rounded-lg sm:px-4 sm:py-2.5 sm:shadow-[0_3px_0_0_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.9)] sm:active:translate-y-[2px] sm:active:shadow-[0_1px_0_0_rgba(0,0,0,0.06),inset_0_2px_3px_rgba(0,0,0,0.08)]"
                      title={t("quickLong")}
                    >
                      <span className="text-sm font-semibold tabular-nums text-blue-600 sm:text-lg">
                        {currentPrice.toFixed(5)}
                      </span>
                      <span className="text-xs font-medium text-blue-600 sm:text-sm">{t("buy")}</span>
                    </button>
                  </div>
                )}
                {/* 2. インジケータ表示テキスト */}
                {indicatorInstances.filter((i) => i.params.enabled).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {indicatorInstances
                      .filter((i) => i.params.enabled)
                      .map((inst) => {
                        const typeInfo = UNIQUE_INDICATOR_TYPES.find((t) => t.id === inst.typeId);
                        const parts = [inst.params.period];
                        if (inst.params.period2 != null) parts.push(inst.params.period2);
                        if (inst.params.period3 != null) parts.push(inst.params.period3);
                        const label = typeInfo ? `${typeInfo.name} (${parts.join(", ")})` : inst.typeId;
                        return (
                          <button
                            key={inst.instanceId}
                            type="button"
                            onClick={() => setIndicatorSettingsInstanceId(inst.instanceId)}
                            className="rounded border border-border/80 bg-background/95 px-2 py-1 text-xs font-medium shadow-sm transition hover:bg-muted"
                            style={{
                              borderLeftWidth: 3,
                              borderLeftColor: inst.color ?? "#64748b",
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                  </div>
                )}
                {/* 3. バックテスト Run のマーカー（Run ID 表示でどの run か確認可能） */}
                {(runTrades && runTrades.length > 0) && (
                  <div className="flex flex-col gap-1">
                    {runIdFromUrl && (
                      <span className="text-[10px] text-muted-foreground" title={t("runLabelHint")}>
                        {t("runLabel")}: {runIdFromUrl}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant={hideRunMarkers ? "secondary" : "outline"}
                      size="sm"
                      className="h-8 w-fit text-xs shadow-sm"
                      onClick={() => setHideRunMarkers((v) => !v)}
                    >
                      {hideRunMarkers ? t("showMarkers") : t("hideMarkers")}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* 下パネル：境界線（ResizeBar）をこの中に含む */}
        <div
          style={{ height: panelHeightPx }}
          className="relative flex shrink-0 flex-col border-t bg-card"
        >
          {/* 境界線：パネルの最上部に absolute で浮かせる */}
          <div
            role="separator"
            aria-label={t("panelResize")}
            onMouseDown={handleResizeStart}
            className="absolute -top-1 left-0 z-50 h-2 w-full cursor-ns-resize transition-colors hover:bg-primary/30"
            title={t("panelResizeTitle")}
          />
          {/* パネルの中身 */}
          <div className="h-full overflow-auto">
          <Tabs defaultValue="position" className="flex min-h-0 w-full flex-1 flex-col min-w-0">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b px-2 pt-2 sm:px-4">
            <TabsList className="h-8 shrink-0">
              <TabsTrigger value="position">{t("position")}</TabsTrigger>
              <TabsTrigger value="orders">{t("orderHistory")}</TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1"
              onClick={() => setEntryOpen(true)}
              disabled={!currentBar}
              title={t("manualEntryTitle")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("manualEntry")}</span>
            </Button>
          </div>
          <div className="min-w-0 px-2 py-2 sm:px-4">
            {/* 資産残高（MT5/TradingView 風）：上部に表示し、決済ごとに変動 */}
            <div
              key={`balance-${replayTime ?? 0}`}
              className="mb-2 flex items-center justify-between border-b pb-2 text-sm"
            >
              <span className="text-muted-foreground">{t("balance")}</span>
              <span className="font-mono text-base font-semibold tabular-nums">
                ${balance.toFixed(2)}
              </span>
            </div>
            {/* replayTime を key にし、再生で state が変わるたびブロックごと再描画 */}
            <div
              key={`replay-${replayTime ?? 0}`}
              className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-6"
            >
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t("replayPosition")}</span>
                  <span className="font-mono tabular-nums">
                    {bars.length > 0 ? `${currentBarIndex + 1} / ${bars.length}` : "—"}
                  </span>
                </div>
                {timeframe !== "M1" && m1Range != null && (
                  <span className="text-[10px] text-muted-foreground sm:ml-2">
                    {useM1Replay ? t("m1Replay") : m1Loading ? t("m1ReplayPreparing") : null}
                  </span>
                )}
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("currentPrice")}</span>
                <span className="font-mono tabular-nums">
                  {currentPrice > 0 ? currentPrice.toFixed(5) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("unrealizedPnl")}</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    unrealizedSumMoney >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {(unrealizedSumMoney >= 0 ? "+" : "") + `$${unrealizedSumMoney.toFixed(2)}`}
                </span>
              </div>
            </div>
            <TabsContent value="position" className="mt-0">
              <Card>
                <CardHeader className="py-2 text-sm font-medium">{t("positions")}</CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("symbol")}</TableHead>
                        <TableHead className="text-right">{t("unrealizedPnl")}</TableHead>
                        <TableHead className="text-right">{t("quantity")}</TableHead>
                        <TableHead>{t("longShort")}</TableHead>
                        <TableHead>{t("takeProfit")}</TableHead>
                        <TableHead>{t("stopLoss")}</TableHead>
                        <TableHead className="text-right">{t("current")}</TableHead>
                        <TableHead className="text-right">{t("executed")}</TableHead>
                        <TableHead>{t("leverage")}</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visiblePositions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground">
                            {t("noPositions")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        visiblePositions.map((pos) => {
                          const pnlMoney = computeUnrealizedPnlMoney(pos, currentPrice);
                          return (
                            <TableRow key={pos.id}>
                              <TableCell className="font-mono">{pos.symbol}</TableCell>
                              <TableCell
                                className={cn(
                                  "text-right font-mono tabular-nums",
                                  pnlMoney >= 0 ? "text-primary" : "text-destructive"
                                )}
                              >
                                {(pnlMoney >= 0 ? "+" : "") + `$${pnlMoney.toFixed(2)}`}
                              </TableCell>
                              <TableCell className="text-right font-mono">{pos.quantity}</TableCell>
                              <TableCell
                                className={pos.side === "Long" ? "text-primary" : "text-destructive"}
                              >
                                {pos.side}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground tabular-nums">
                                {pos.takeProfit != null ? pos.takeProfit.toFixed(5) : "—"}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground tabular-nums">
                                {pos.stopLoss != null ? pos.stopLoss.toFixed(5) : "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {currentPrice.toFixed(5)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {pos.entryPrice.toFixed(5)}
                              </TableCell>
                              <TableCell className="font-mono">{pos.leverage}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  title={t("closePosition")}
                                  onClick={() => handleClosePosition(pos.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-0">
              <Card>
                <CardHeader className="py-2 text-sm font-medium">{t("orderHistoryHeader")}</CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("exitTime")}</TableHead>
                        <TableHead>{t("symbol")}</TableHead>
                        <TableHead>{t("side")}</TableHead>
                        <TableHead className="text-right">{t("entry")}</TableHead>
                        <TableHead className="text-right">{t("exit")}</TableHead>
                        <TableHead className="text-right">{t("quantity")}</TableHead>
                        <TableHead className="text-right">{t("pnl")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedTrades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            {t("noClosedTrades")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...closedTrades]
                          .filter((t) => currentBar && t.exitTime <= currentBar.time)
                          .reverse()
                          .map((t) => {
                            const pnlMoney = computeRealizedPnlMoney(t, t.exitPrice);
                            const exitDate = new Date(t.exitTime * 1000);
                            const exitStr = exitDate.toLocaleString("ja", {
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                            return (
                              <TableRow key={`${t.id}-${t.exitTime}`}>
                                <TableCell className="text-muted-foreground">{exitStr}</TableCell>
                                <TableCell className="font-mono">{t.symbol}</TableCell>
                                <TableCell
                                  className={t.side === "Long" ? "text-primary" : "text-destructive"}
                                >
                                  {t.side}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {t.entryPrice.toFixed(5)}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {t.exitPrice.toFixed(5)}
                                </TableCell>
                                <TableCell className="text-right font-mono">{t.quantity}</TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right font-mono tabular-nums",
                                    pnlMoney >= 0 ? "text-primary" : "text-destructive"
                                  )}
                                >
                                  {(pnlMoney >= 0 ? "+" : "") + `$${pnlMoney.toFixed(2)}`}
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("entryDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("direction")}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={entrySide === "Long" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntrySide("Long")}
                >
                  Long
                </Button>
                <Button
                  type="button"
                  variant={entrySide === "Short" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntrySide("Short")}
                >
                  Short
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qty">{t("qty")}</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={entryQty}
                onChange={(e) => setEntryQty(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tp">{t("tpOptional")}</Label>
              <Input
                id="tp"
                type="number"
                step="any"
                placeholder={t("tpPlaceholder")}
                value={entryTp}
                onChange={(e) => setEntryTp(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sl">{t("slOptional")}</Label>
              <Input
                id="sl"
                type="number"
                step="any"
                placeholder={t("slPlaceholder")}
                value={entrySl}
                onChange={(e) => setEntrySl(e.target.value)}
              />
            </div>
            {currentBar && (
              <p className="text-xs text-muted-foreground">
                {t("entryPriceNote", { price: currentBar.close.toFixed(5) })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEntryOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={handleAddPosition} disabled={!currentBar}>
              {t("entryButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("rulesDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="env-balance">{t("marginBalance")}</Label>
              <Input
                id="env-balance"
                type="number"
                min={0}
                step={100}
                value={envBalance}
                onChange={(e) => setEnvBalance(e.target.value)}
                placeholder={t("balancePlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="env-spread">{t("spreadPips")}</Label>
              <Input
                id="env-spread"
                type="number"
                min={0}
                step={0.1}
                value={envSpread}
                onChange={(e) => setEnvSpread(e.target.value)}
                placeholder={t("spreadPlaceholder")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="env-leverage">{t("leverageLabel")}</Label>
              <Input
                id="env-leverage"
                type="number"
                min={1}
                value={envLeverage}
                onChange={(e) => setEnvLeverage(e.target.value)}
                placeholder={t("leveragePlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRulesDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={() => setRulesDialogOpen(false)}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={indicatorsDialogOpen} onOpenChange={setIndicatorsDialogOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-sm overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("indicatorsDialogTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("indicatorsDialogDesc")}
          </p>
          <div className="grid gap-1 py-4">
            {UNIQUE_INDICATOR_TYPES.map((t) => {
              const firstDef = getDefById(t.defIds[0]);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setIndicatorInstances((prev) => [
                      ...prev,
                      {
                        instanceId: generateInstanceId(),
                        typeId: t.id,
                        params: getDefaultParamsForTypeId(t.id),
                        color: firstDef?.color,
                      },
                    ]);
                  }}
                  className="flex items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-muted/60"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: firstDef?.color ?? "#64748b" }}
                  />
                  <span className="font-medium">{t.name}</span>
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIndicatorsDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* インジケータ設定モーダル（左上ラベルクリックで開く・TradingView風） */}
      <Dialog
        open={indicatorSettingsInstanceId != null}
        onOpenChange={(open) => !open && setIndicatorSettingsInstanceId(null)}
      >
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto">
          {indicatorSettingsInstanceId && (() => {
            const inst = indicatorInstances.find((i) => i.instanceId === indicatorSettingsInstanceId);
            const typeInfo = inst ? UNIQUE_INDICATOR_TYPES.find((t) => t.id === inst.typeId) : null;
            const firstDef = typeInfo ? getDefById(typeInfo.defIds[0]) : null;
            if (!inst || !typeInfo || !firstDef) {
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{t("indicatorSettingsTitle")}</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">{t("indicatorNotFound")}</p>
                </>
              );
            }
            const updateInst = (patch: Partial<IndicatorInstance>) =>
              setIndicatorInstances((prev) =>
                prev.map((i) => (i.instanceId === inst.instanceId ? { ...i, ...patch } : i))
              );
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{typeInfo.name}</DialogTitle>
                </DialogHeader>
                <Tabs value={indicatorSettingsTab} onValueChange={(v) => setIndicatorSettingsTab(v as typeof indicatorSettingsTab)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="params">{t("paramsTab")}</TabsTrigger>
                    <TabsTrigger value="style">{t("styleTab")}</TabsTrigger>
                    <TabsTrigger value="visibility">{t("visibilityTab")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="params" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("period")}</Label>
                        <Input
                          type="number"
                          min={1}
                          value={indicatorEditParams.period}
                          onChange={(e) =>
                            setIndicatorEditParams((p) => ({ ...p, period: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                          }
                        />
                      </div>
                      {firstDef.period2 != null && (
                        <div className="space-y-1">
                          <Label className="text-xs">{t("period2")}</Label>
                          <Input
                            type="number"
                            min={1}
                            value={indicatorEditParams.period2 ?? firstDef.period2 ?? ""}
                            onChange={(e) =>
                              setIndicatorEditParams((p) => ({
                                ...p,
                                period2: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                          />
                        </div>
                      )}
                      {firstDef.period3 != null && (
                        <div className="space-y-1">
                          <Label className="text-xs">期間3</Label>
                          <Input
                            type="number"
                            min={1}
                            value={indicatorEditParams.period3 ?? firstDef.period3 ?? ""}
                            onChange={(e) =>
                              setIndicatorEditParams((p) => ({
                                ...p,
                                period3: Math.max(1, parseInt(e.target.value, 10) || 1),
                              }))
                            }
                          />
                        </div>
                      )}
                      {firstDef.mult != null && (
                        <div className="space-y-1">
                          <Label className="text-xs">{t("mult")}</Label>
                          <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={indicatorEditParams.mult ?? firstDef.mult ?? ""}
                            onChange={(e) =>
                              setIndicatorEditParams((p) => ({
                                ...p,
                                mult: Math.max(0.1, parseFloat(e.target.value) || 0.1),
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="style" className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("color")}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={indicatorEditColor}
                          onChange={(e) => setIndicatorEditColor(e.target.value)}
                          className="h-9 w-14 cursor-pointer rounded border"
                        />
                        <Input
                          value={indicatorEditColor}
                          onChange={(e) => setIndicatorEditColor(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="visibility" className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ind-visibility"
                        checked={indicatorEditParams.enabled}
                        onCheckedChange={(checked) =>
                          setIndicatorEditParams((p) => ({ ...p, enabled: !!checked }))
                        }
                      />
                      <label htmlFor="ind-visibility" className="text-sm font-medium">
                        {t("showOnChart")}
                      </label>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="flex-row gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    className="mr-auto"
                    onClick={() => {
                      setIndicatorInstances((prev) => prev.filter((i) => i.instanceId !== inst.instanceId));
                      setIndicatorSettingsInstanceId(null);
                    }}
                  >
                    削除
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIndicatorSettingsInstanceId(null)}>
                      キャンセル
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        updateInst({ params: indicatorEditParams, color: indicatorEditColor });
                        setIndicatorSettingsInstanceId(null);
                      }}
                    >
                      OK
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChartPageFallback() {
  const t = useTranslations("Chart");
  return (
    <div className="flex h-screen items-center justify-center">
      {t("loadingChart")}
    </div>
  );
}

export default function ChartPage() {
  return (
    <Suspense fallback={<ChartPageFallback />}>
      <ChartPageInner />
    </Suspense>
  );
}
