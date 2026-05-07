// frontend/src/app/app/RunClient.tsx
'use client';

const PaywallDialog: React.FC<any> = () => null;
import React, { useEffect, useMemo, useState } from "react";
import { NumberField } from "@/components/forms/NumberField";
import { Section } from "@/components/forms/Section";
import { Field } from "@/components/forms/Field";
import { EquityChart } from "@/components/charts/EquityChart";
import { useCatalog, groupPairs } from "@/features/run/hooks/useCatalog";
import type { Direction, EntryType,EquityPoint } from "@/features/run/types";
import ShareButton from '@/components/share/ShareButton';
import { executeRun, genIdemKey, pollReport } from "@/lib/backtest";
import { IndicatorForm } from "@/components/forms/IndicatorForm";
import { DEFAULT_PARAMS } from "./defaults";
import { TEXT } from "./text"; // 例：同階層に text.ts を置く 
import { ExitSection } from './ExitSection';  
import { EntrySection } from './EntrySection';


// import { triggerSim } from "@/lib/api/triggerSim";



// ★ フリー化フラグ（envでも可）
const FREE_MODE =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_FREE_MODE === '1'
    : true; // 手動で true にしておけば常にフリー

const APP_ORIGIN =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://delvertrade.com');


export default function RunClient({ used, limit }: { used: number; limit: number }) {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>("long"); // <- これを必ず定義



  // Catalog
  const { catalog, catalogError, hasCatalog } = useCatalog();

  // === selections ===
  const [pair, setPair] = useState<string>("EURUSD");
  const [timeframe, setTimeframe] = useState<string>("H1");
  useEffect(() => {
    if (catalog.pairs.length > 0) setPair((p) => catalog.pairs.includes(p) ? p : catalog.pairs[0]);
    if (catalog.timeframes.length > 0) setTimeframe((tf) => catalog.timeframes.includes(tf) ? tf : catalog.timeframes[0]);
  }, [catalog.pairs, catalog.timeframes]);

type Side = "single" | "long" | "short";
type AnyParams = Record<string, any>;

type EntryState = {
  single: { type: EntryType; params: AnyParams };
  long:   { type: EntryType; params: AnyParams };
  short:  { type: EntryType; params: AnyParams };
};

const [entry, setEntry] = useState<EntryState>({
  single: { type: "ema_cross", params: { emaFast: 12, emaSlow: 32, emaCross: "above" } },
  long:   { type: "ema_cross", params: { emaFast: 12, emaSlow: 32, emaCross: "above" } },
  short:  { type: "ema_cross", params: { emaFast: 12, emaSlow: 32, emaCross: "below" } }, // 好みで
});

  const [timeStopBars, setTimeStopBars] = useState(100);
  const [trailAtr, setTrailAtr] = useState(2);
  const [trailRRToBE, setTrailRRToBE] = useState(1);
  const [feeBps, setFeeBps] = useState(1.5);
  const [slipBps, setSlipBps] = useState(2);

  // switches
  const [useTimeStop, setUseTimeStop]   = useState(true);
  const [useSLATR, setUseSLATR]         = useState(true);
  const [useTrailing, setUseTrailing]   = useState(true);
  const [trailingMode, setTrailingMode] = useState<"breakeven"|"atr">("breakeven");

  // === Exit / TP / Indicator-Exit ===
const [useTP, setUseTP] = useState(true);
const [tpRR, setTpRR] = useState(2.0);

// Breakeven 詳細
const [beOffsetPips, setBeOffsetPips] = useState(0);

// ATRトレール 詳細
const [trailAtrLen, setTrailAtrLen] = useState(14);
const [trailAtrMult, setTrailAtrMult] = useState(2.5);
const [trailAtrMode, setTrailAtrMode] = useState<'chandelier'|'step'>('chandelier');
const [trailAtrLookback, setTrailAtrLookback] = useState(22);

// Indicator Exit（まずはRSI 30/70 + 50ミッドライン）
const [useIndicatorExit, setUseIndicatorExit] = useState(true);
const [rsiExitLen, setRsiExitLen] = useState(14);
const [useOppositeExit, setUseOppositeExit] = useState(true);



  // run state
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [equity, setEquity] = useState<EquityPoint[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [resultId, setResultId] = useState<string | null>(null);

function toInt(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

const onChangeLongType = (newType: EntryType) => {
  setEntry(prev => ({
    ...prev,
    long: {
      type: newType,
      // ここで前の emaFast/emaSlow 等を引きずらないように丸ごと入れ替える
      params: { ...DEFAULT_PARAMS[newType] },
    },
  }));
};

// Short も同様
const onChangeShortType = (newType: EntryType) => {
  setEntry(prev => ({
    ...prev,
    short: {
      type: newType,
      params: { ...DEFAULT_PARAMS[newType] },
    },
  }));
};

const onChangeSingleType = (newType: EntryType) => {
  setEntry(prev => ({
    ...prev,
    single: {
      type: newType,
      params: { ...DEFAULT_PARAMS[newType] }, // ← デフォルトを必ず入れる
    },
  }));
};

function buildEntry(
  type: EntryType,
  p: any,
  side: "long" | "short" | "single",
  direction: "long" | "short" | "both"
) {
  const params = p?.params ?? p;

  const toInt = (x:any) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };
  const normCross = (v:any) => v == null ? undefined : String(v).toLowerCase();

  switch (type) {
    case "ema_cross": {
      // long/short/single どれで来ても拾う
      const rawCross =
        params.emaCross ??
        params.cross ??
        (side === "long" ? params.longCross : side === "short" ? params.shortCross : undefined);

      const cross = normCross(rawCross); // "above" | "below"
      if (!cross) {
        throw new Error('ema_cross: "cross" is required ("above" | "below")');
      }

      return {
        type: "ema_cross",
        fast: toInt(params.emaFast)!,
        slow: toInt(params.emaSlow)!,
        cross,                // ← 計算済みをセット
        side,
      };
    }

    case "breakout":
      return {
        type: "breakout",
        lookback: toInt(params.lookback)!,
        side,
      };

case "rsi_threshold": {
  const length = toInt(params.length);
  const level  = toNum(params.level);
  const event  = params.event as "cross_up" | "cross_down" | undefined;

  if (length == null || level == null || !event) {
    throw new Error("RSI: length/level/event が不足");
  }

      return {
        type: "rsi_threshold",
        length,
        level,
        event,
        side: side === "single" ? (direction === "long" ? "long" : "short") : side,
      };
    }


    case "macd":
      return {
        type: "macd",
        fast: toInt(params.fast)!,
        slow: toInt(params.slow)!,
        signal: toInt(params.signal)!,
        event: params.event,
        side,
      };

    case "bbands":
      return {
        type: "bbands",
        length: toInt(params.length)!,
        mult: Number(params.mult),
        event: params.event,
        side,
      };

    case "stoch":
      return {
        type: "stoch",
        k: toInt(params.k)!,
        d: toInt(params.d)!,
        smooth: toInt(params.smooth)!,
        overbought: Number(params.overbought),
        oversold: Number(params.oversold),
        event: params.event,
        side,
      };

    case "adx_threshold":
      return {
        type: "adx_threshold",
        length: toInt(params.length)!,
        level: Number(params.level),
        event: params.event,
        side,
      };

    case "cci_threshold":
      return {
        type: "cci_threshold",
        length: toInt(params.length)!,
        level: Number(params.level),
        event: params.event,
        side,
      };

    case "vwap":
      return {
        type: "vwap",
        event: params.event,
        side,
      };

    case "supertrend":
      return {
        type: "supertrend",
        length: toInt(params.length)!,
        multiplier: Number(params.multiplier),
        event: params.event,
        side,
      };

    case "donchian_breakout":
      return {
        type: "donchian_breakout",
        lookback: toInt(params.lookback)!,
        side,
      };

    default:
      throw new Error(`Unsupported entry type: ${type}`);
  }
}

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

type Builder = (p: any) => any;

  // payload
const BUILDERS: Record<EntryType, Builder> = {
  sma_cross: p => ({
    type: "sma_cross",
    short: toInt(p.smaShort)!,
    long: toInt(p.smaLong)!,
    side: p.smaSide, // "long" | "short" | undefined
  }),

ema_cross: (p) => ({
  type: "ema_cross",
  fast: toInt(p.emaFast)!,
  slow: toInt(p.emaSlow)!,
  cross: (p.emaCross ?? "above") as "above" | "below",
  side: p.emaSide, // 任意
}),


  rsi_threshold: p => ({
    type: "rsi_threshold",
    length: toInt(p.rsiLen)!,
    level: toNum(p.rsiLevel)!,
    event: p.rsiEvent, // "cross_up" | "cross_down"
    side: p.rsiSide,
  }),

  breakout: p => ({
    type: "breakout",
    lookback: toInt(p.brkLookback)!,
    side: p.brkSide, // "high" | "low"
  }),

  macd: p => ({
    type: "macd",
    fast: toInt(p.macdFast)!,
    slow: toInt(p.macdSlow)!,
    signal: toInt(p.macdSig)!,
    event: p.macdEvent, // "cross_up" | "cross_down" | "above_zero" | "below_zero"
    side: p.macdSide,
  }),

  bbands: p => ({
    type: "bbands",
    length: toInt(p.bbLen)!,
    mult: toNum(p.bbMult)!,
    event: p.bbEvent, // cross_above_upper | cross_below_lower | ...
    side: p.bbSide,
  }),

  stoch: p => ({
    type: "stoch",
    k: toInt(p.stochK)!,
    d: toInt(p.stochD)!,
    smooth: toInt(p.stochSm)!,
    overbought: toNum(p.stochOb)!,
    oversold: toNum(p.stochOs)!,
    event: p.stochEvent, // "k_over_d_cross_up" | ...
    side: p.stochSide,
  }),

  adx_threshold: p => ({
    type: "adx_threshold",
    length: toInt(p.adxLen)!,
    level: toNum(p.adxLevel)!,
    event: p.adxEvent, // "adx_gt" | "adx_lt"
    side: p.adxSide,
  }),

  cci_threshold: p => ({
    type: "cci_threshold",
    length: toInt(p.cciLen)!,
    level: toNum(p.cciLevel)!,
    event: p.cciEvent, // "cross_up" | "cross_down"
    side: p.cciSide,
  }),

  vwap: p => ({
    type: "vwap",
    event: p.vwapEvent, // "price_cross_above" | "price_cross_below"
    side: p.vwapSide,
  }),

  supertrend: p => ({
    type: "supertrend",
    length: toInt(p.stLen)!,
    multiplier: toNum(p.stMult)!,
    event: p.stEvent, // "trend_up" | "trend_down"
    side: p.stSide,
  }),

  donchian_breakout: p => ({
    type: "donchian_breakout",
    lookback: toInt(p.donLen)!,
    side: p.donSide, // "high" | "low"
  }),
};




function toEntryObj(
  sideName: "long"|"short"|"single",
  e: { type: EntryType; params: any },
  dir: Direction
) {
  const obj = BUILDERS[e.type](e.params);
  if (!obj) return undefined;                  // 未入力の時は送らない
  (obj as any).side = (dir === "both") ? sideName : dir; // "long" | "short"
  return obj;                                  // { type: "...", ..., side: "long" }
}


const payload = useMemo(() => {
  const base: any = {
    pair, timeframe, direction,
    fee_bps: Number(feeBps),
    slippage_bps: Number(slipBps),
    entry: [] as any[],
    exit: {} as any
  };

if (direction === "both") {
  base.entry = [
    buildEntry(entry.long.type,  entry.long,  "long",  direction),
    buildEntry(entry.short.type, entry.short, "short", direction),
  ].filter(Boolean);
} else {
  base.entry = [
    buildEntry(
      entry.single.type,
      entry.single,
      "single",
      direction
    )
  ].filter(Boolean);
    if (base.entry[0]) {
    base.entry[0].side = direction as "long" | "short";
  }
}


  // exit は有効なものだけキーを入れる（null を送らない）
  if (useTimeStop) base.exit.time_stop = toInt(timeStopBars);
  if (useTP)       base.exit.take_profit_r_multiple = toNum(tpRR);

  if (useTrailing) {
    base.exit.trailing = trailingMode; // "breakeven" | "atr"
    if (trailingMode === "breakeven") {
      base.exit.trailing_rr = toNum(trailRRToBE);
      base.exit.breakeven_offset_pips = toInt(beOffsetPips) ?? 0;
    } else {
      base.exit.atr = {
        length: toInt(trailAtrLen),
        mult:   toNum(trailAtrMult),
        mode:   trailAtrMode,
        lookback: toInt(trailAtrLookback),
      };
    }
  }

  if (useIndicatorExit) {
    base.exit.rsi_exit = { length: toInt(rsiExitLen) ?? 14, use_30_70: true, use_midline: true };
  }
  if (useOppositeExit) base.exit.opposite_signal_exit = true;

  base.entries = base.entry; // 後方互換が必要なら残す

  return base;
}, [
  // 依存配列は「この useMemo 内で参照したもの」だけ
  pair, timeframe, direction, feeBps, slipBps,entry,
  useTimeStop, timeStopBars, useSLATR, trailAtr,
  useTrailing, trailingMode, useTP, tpRR,
  beOffsetPips, trailAtrLen, trailAtrMult, trailAtrMode, trailAtrLookback,
  useIndicatorExit, rsiExitLen, useOppositeExit,
]);

// gate → execute → poll
async function handleRun() {
  setRunning(true);
  setError(null);

  try {
    // ★ 完全無料：ゲートを飛ばす
    // if (!FREE_MODE) {
    //   // 以前の「日3回ゲート」→ 完全無料では不使用
    //   const gate = await triggerSim({ kind: "trade-sim", user_id: null, anon_id: getAnonId() });
    //   if (!gate.ok) {
    //     if (gate.reason === "limit") { setError(null); /* トースト等 */ }
    //     else setError("一時的なエラーが発生しました。");
    //     return;
    //   }
    // }

    // 従来どおりサーバー実行
    const { run_id, plan } = await executeRun(payload, { idem: genIdemKey() });
    setRunId(run_id);
    localStorage.setItem("last_run_id", run_id);
    localStorage.setItem("last_run_pair", pair);
    localStorage.setItem("last_run_timeframe", timeframe);
    if (typeof setCurrentPlan === "function") setCurrentPlan(plan as any);

    const data = await pollReport(run_id);
    setSummary(data.summary ?? null);
    setEquity(Array.isArray(data.equity) ? data.equity : []);
    setResultId(data.resultId ?? data.id ?? run_id);

  } catch (e: any) {
    // ★ 完全無料ではサーバーから402は返さない想定なので、ペイウォール分岐は握りつぶす
    // if (e?.code === "SHOW_PAYWALL" && !FREE_MODE) {
    //   setPaywallOpen(true);
    //   setError(null);
    //   return;
    // }
    if (e?.code === "UNAUTHORIZED") {
      const loc = typeof document !== "undefined" ? document.documentElement.lang || "ja" : "ja";
      location.href = `/${loc}/login?next=/${loc}/app`;
      return;
    }
    setError(e?.message ?? "実行に失敗しました");
  } finally {
    setRunning(false);
  }
}



const shareUrl = useMemo(() => {
  if (!resultId) return '';
  return `${APP_ORIGIN}/app/results/${resultId}`;
}, [resultId]);
  

return (
  <div className="max-w-5xl mx-auto px-4 py-6">
    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
      {TEXT.title}
      <span className="text-xs rounded-full px-2 py-0.5 bg-gray-900 text-white">
        {TEXT.beta}
      </span>
    </h1>

    {/* Beta notice */}
    <div className="mb-4 rounded-xl border bg-amber-50 text-amber-900 p-3 text-sm">
      <p className="font-medium">{TEXT.betaNoteTitle}</p>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        {TEXT.betaNotes.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>

    {!hasCatalog && (
      <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-xl border">
        {catalogError
          ? `${TEXT.catalogLoadFailed}: ${catalogError}`
          : TEXT.catalogLoading}
      </div>
    )}

    <Section title={TEXT.strategyParams}>
      <Field label={TEXT.pair}>
        <select
          className="mt-1 p-2 rounded-xl border"
          value={pair}
          onChange={(e) => setPair(e.target.value)}
          disabled={!hasCatalog}
        >
          {hasCatalog ? (() => {
            const { crypto, fx } = groupPairs(catalog.pairs);
            return (
              <>
                {fx.length > 0 && (
                  <optgroup label="FX">
                    {fx.map((p) => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                )}
                {crypto.length > 0 && (
                  <optgroup label="Crypto">
                    {crypto.map((p) => <option key={p} value={p}>{p}</option>)}
                  </optgroup>
                )}
              </>
            );
          })() : <option>—</option>}
        </select>
      </Field>

      <Field label={TEXT.timeframe}>
        <select
          className="mt-1 p-2 rounded-xl border"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          disabled={!hasCatalog}
        >
          {hasCatalog
            ? catalog.timeframes.map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))
            : <option>—</option>}
        </select>
      </Field>

      <Field label={TEXT.direction}>
        <select
          className="mt-1 p-2 rounded-xl border"
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
        >
          <option value="long">{TEXT.long}</option>
          <option value="short">{TEXT.short}</option>
          <option value="both">{TEXT.both}</option>
        </select>
      </Field>
    </Section>

<EntrySection
  direction={direction}
  setDirection={setDirection}
  entry={entry}
  setEntry={setEntry}
  onChangeSingleType={onChangeSingleType}
  onChangeLongType={onChangeLongType}
  onChangeShortType={onChangeShortType}
/>

<ExitSection
  useTimeStop={useTimeStop}
  setUseTimeStop={setUseTimeStop}
  timeStopBars={timeStopBars}
  setTimeStopBars={setTimeStopBars}

  useTP={useTP}
  setUseTP={setUseTP}
  tpRR={tpRR}
  setTpRR={setTpRR}

  useSLATR={useSLATR}
  setUseSLATR={setUseSLATR}
  trailAtr={trailAtr}
  setTrailAtr={setTrailAtr}

  useTrailing={useTrailing}
  setUseTrailing={setUseTrailing}
  trailingMode={trailingMode}
  setTrailingMode={setTrailingMode}
  trailRRToBE={trailRRToBE}
  setTrailRRToBE={setTrailRRToBE}
  beOffsetPips={beOffsetPips}
  setBeOffsetPips={setBeOffsetPips}

  trailAtrLen={trailAtrLen}
  setTrailAtrLen={setTrailAtrLen}
  trailAtrMult={trailAtrMult}
  setTrailAtrMult={setTrailAtrMult}
  trailAtrMode={trailAtrMode}
  setTrailAtrMode={setTrailAtrMode}
  trailAtrLookback={trailAtrLookback}
  setTrailAtrLookback={setTrailAtrLookback}

  useIndicatorExit={useIndicatorExit}
  setUseIndicatorExit={setUseIndicatorExit}
  rsiExitLen={rsiExitLen}
  setRsiExitLen={setRsiExitLen}

  useOppositeExit={useOppositeExit}
  setUseOppositeExit={setUseOppositeExit}

  feeBps={feeBps}
  setFeeBps={setFeeBps}
  slipBps={slipBps}
  setSlipBps={setSlipBps}
/>

    <div className="flex gap-3 items-center mb-4">
      <button
        className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50"
        onClick={handleRun}
        disabled={running || !hasCatalog}
      >
        {running ? TEXT.running : TEXT.run}
      </button>

      {runId && (
        <span className="text-sm text-gray-600">
          {TEXT.runId}: {runId}
        </span>
      )}

      {(error || catalogError) && (
        <span className="text-sm text-red-600">
          {error ?? catalogError}
        </span>
      )}
    </div>

    <div className="rounded-2xl border p-4">
      <h2 className="font-semibold mb-3">{TEXT.results}</h2>
      {summary && (
        <pre className="text-xs bg-gray-50 p-2 rounded-xl overflow-auto mb-4">
          {JSON.stringify(summary, null, 2)}
        </pre>
      )}
      <EquityChart data={equity} height={300} />
      {resultId && <ShareButton url={shareUrl} />}
    </div>

    <PaywallDialog
      open={paywallOpen}
      onOpenChange={setPaywallOpen}
      used={used}
      limit={limit}
    />



  </div>
);
}