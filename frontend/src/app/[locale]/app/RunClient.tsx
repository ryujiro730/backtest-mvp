'use client';

import React, { useEffect, useMemo, useState } from "react";
import mixpanel from "mixpanel-browser";
import PaywallDialog from "@/components/billing/PaywallDialog";
import { NumberField } from "@/components/forms/NumberField";
import { Section } from "@/components/forms/Section";
import { Field } from "@/components/forms/Field";
import { EquityChart } from "@/components/charts/EquityChart";
import { useCatalog } from "@/features/run/hooks/useCatalog";
import { executeRun, pollReport, genIdemKey } from "@/features/run/services/backtest";
import type { Direction, EntryType, RsiEvent, Catalog, EquityPoint } from "@/features/run/types";

export default function RunClient({ used, limit }: { used: number; limit: number }) {
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Analytics
  useEffect(() => {
    mixpanel.init("564958c137c3bab43e6332b7aab074e5", { debug: true });
    mixpanel.track("Page Viewed", { page: "App" });
  }, []);

  // Catalog
  const { catalog, catalogError, hasCatalog } = useCatalog();

  // === selections ===
  const [pair, setPair] = useState<string>("EURUSD");
  const [timeframe, setTimeframe] = useState<string>("H1");
  useEffect(() => {
    if (catalog.pairs.length > 0) setPair((p) => catalog.pairs.includes(p) ? p : catalog.pairs[0]);
    if (catalog.timeframes.length > 0) setTimeframe((tf) => catalog.timeframes.includes(tf) ? tf : catalog.timeframes[0]);
  }, [catalog.pairs, catalog.timeframes]);

  // === Strategy fields ===
  const [direction, setDirection] = useState<Direction>("long");
  const [entryType, setEntryType] = useState<EntryType>("ema_cross");
  const [emaFast, setEmaFast] = useState(12);
  const [emaSlow, setEmaSlow] = useState(32);
  const [brkLookback, setBrkLookback] = useState(20);
  const [rsiLen, setRsiLen] = useState(14);
  const [rsiLevel, setRsiLevel] = useState(55);
  const [rsiEvent, setRsiEvent] = useState<RsiEvent>("cross_up");

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

  // run state
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [equity, setEquity] = useState<EquityPoint[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // payload
  const payload = useMemo(() => {
    const breakoutSide = direction === "short" ? "down" : "up";
    const base: any = {
      pair, timeframe, direction,
      fee_bps: feeBps, slippage_bps: slipBps,
      entry: [], exit: {},
    };
    if (useTimeStop && timeStopBars > 0) base.exit.time_stop_bars = { bars: Math.floor(timeStopBars) };
    if (useTrailing) {
      base.exit.trailing = trailingMode === "breakeven"
        ? { mode: "breakeven", rr_to_breakeven: Number(trailRRToBE) }
        : { mode: "atr", atr_multiple: Number(trailAtr) };
    }
    if (entryType === "ema_cross") base.entry=[{type:"ema_cross", fast:Math.floor(emaFast), slow:Math.floor(emaSlow), cross:"above"}];
    else if (entryType === "breakout") base.entry=[{type:"breakout", lookback:Math.floor(brkLookback), side:breakoutSide}];
    else if (entryType === "rsi_threshold") base.entry=[{type:"rsi_threshold", length:Math.floor(rsiLen), level:Number(rsiLevel), event:rsiEvent}];
    return base;
  }, [pair,timeframe,direction,feeBps,slipBps,useTimeStop,timeStopBars,useTrailing,trailingMode,trailRRToBE,trailAtr,entryType,emaFast,emaSlow,brkLookback,rsiLen,rsiLevel,rsiEvent]);

  // gate → execute → poll
  const handleRun = async () => {
    setError(null); setEquity([]); setSummary(null); setRunning(true); setRunId(null);
    try {
      if (!hasCatalog) throw new Error("No datasets registered. Check /api/catalog and MinIO indexes.");

      // 課金ガード（401/402 を返す）
      const g = await fetch("/api/run", { method: "POST" });
      if (g.status === 401) { location.href = "/login"; return; }
      if (g.status === 402) { setPaywallOpen(true); return; }
      if (!g.ok) throw new Error(`POST /api/run ${g.status}`);

      // 実行 → ポーリング（外部API）
      const { run_id } = await executeRun(payload, { idem: genIdemKey() });
      setRunId(run_id);
      const data = await pollReport(run_id);
      setSummary(data.summary ?? null);
      setEquity(Array.isArray(data.equity) ? data.equity : []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Backtest MVP</h1>

      {!hasCatalog && (
        <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-xl border">
          {catalogError ? `Catalog load failed: ${catalogError}` : "Loading catalog or no datasets found. Check /api/catalog and MinIO index."}
        </div>
      )}

      <Section title="基本設定">
        <Field label="Pair">
          <select className="mt-1 p-2 rounded-xl border" value={pair} onChange={(e)=>setPair(e.target.value)} disabled={!hasCatalog}>
            {hasCatalog ? catalog.pairs.map(p => <option key={p} value={p}>{p}</option>) : <option>—</option>}
          </select>
        </Field>
        <Field label="Timeframe">
          <select className="mt-1 p-2 rounded-xl border" value={timeframe} onChange={(e)=>setTimeframe(e.target.value)} disabled={!hasCatalog}>
            {hasCatalog ? catalog.timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>) : <option>—</option>}
          </select>
        </Field>
        <Field label="Direction">
          <select className="mt-1 p-2 rounded-xl border" value={direction} onChange={(e)=>setDirection(e.target.value as Direction)}>
            <option value="long">long</option><option value="short">short</option>
          </select>
        </Field>
        <Field label="Entry Type">
          <select className="mt-1 p-2 rounded-xl border" value={entryType} onChange={(e)=>setEntryType(e.target.value as EntryType)}>
            <option value="ema_cross">EMA Cross</option>
            <option value="breakout">Breakout</option>
            <option value="rsi_threshold">RSI Threshold</option>
          </select>
        </Field>
      </Section>

      {entryType === "ema_cross" && (
        <Section title="EMA Cross">
          <Field label="EMA Fast"><NumberField className="mt-1 p-2 rounded-xl border" integer value={emaFast} onChange={setEmaFast} min={1} /></Field>
          <Field label="EMA Slow"><NumberField className="mt-1 p-2 rounded-xl border" integer value={emaSlow} onChange={setEmaSlow} min={2} /></Field>
        </Section>
      )}
      {entryType === "breakout" && (
        <Section title="Breakout">
          <Field label="Lookback (bars)"><NumberField className="mt-1 p-2 rounded-xl border" integer value={brkLookback} onChange={setBrkLookback} min={1} /></Field>
        </Section>
      )}
      {entryType === "rsi_threshold" && (
        <Section title="RSI Threshold">
          <Field label="RSI Length"><NumberField className="mt-1 p-2 rounded-xl border" integer value={rsiLen} onChange={setRsiLen} min={1} /></Field>
          <Field label="RSI Level"><NumberField className="mt-1 p-2 rounded-xl border" value={rsiLevel} onChange={setRsiLevel} min={1} max={99} /></Field>
          <Field label="Event">
            <select className="mt-1 p-2 rounded-xl border" value={rsiEvent} onChange={(e)=>setRsiEvent(e.target.value as RsiEvent)}>
              <option value="cross_up">cross_up</option>
              <option value="cross_down">cross_down</option>
            </select>
          </Field>
        </Section>
      )}

      <Section title="Exit / Trailing / Costs">
        <Field label="Time Stop (bars)">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={useTimeStop} onChange={e=>setUseTimeStop(e.target.checked)} />
            <NumberField className="mt-1 p-2 rounded-xl border flex-1" integer value={timeStopBars} onChange={setTimeStopBars} min={1} disabled={!useTimeStop}/>
          </div>
        </Field>

        <Field label="Initial SL (ATR x)">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={useSLATR} onChange={e=>setUseSLATR(e.target.checked)} />
            <NumberField className="mt-1 p-2 rounded-xl border flex-1" value={trailAtr} onChange={setTrailAtr} min={0} disabled={!useSLATR}/>
          </div>
        </Field>

        <Field label="Trailing">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={useTrailing} onChange={e=>setUseTrailing(e.target.checked)} />
            <select className="mt-1 p-2 rounded-xl border" value={trailingMode}
                    onChange={e=>setTrailingMode(e.target.value as any)} disabled={!useTrailing}>
              <option value="breakeven">breakeven</option>
              <option value="atr">atr</option>
            </select>
            {trailingMode === "breakeven" ? (
              <NumberField className="mt-1 p-2 rounded-xl border" value={trailRRToBE}
                           onChange={setTrailRRToBE} min={0} disabled={!useTrailing}/>
            ) : (
              <NumberField className="mt-1 p-2 rounded-xl border" value={trailAtr}
                           onChange={setTrailAtr} min={0} disabled={!useTrailing}/>
            )}
          </div>
        </Field>

        <Field label="Fee (bps)"><NumberField className="mt-1 p-2 rounded-xl border" value={feeBps} onChange={setFeeBps} min={0}/></Field>
        <Field label="Slippage (bps)"><NumberField className="mt-1 p-2 rounded-xl border" value={slipBps} onChange={setSlipBps} min={0}/></Field>
      </Section>

      <div className="flex gap-3 items-center mb-4">
        <button className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50" onClick={handleRun} disabled={running || !hasCatalog}>
          {running ? "Running..." : "Run"}
        </button>
        {runId && <span className="text-sm text-gray-600">run_id: {runId}</span>}
        {(error || catalogError) && <span className="text-sm text-red-600">{error ?? catalogError}</span>}
      </div>

      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Results</h2>
        {summary && (
          <pre className="text-xs bg-gray-50 p-2 rounded-xl overflow-auto mb-4">
            {JSON.stringify(summary, null, 2)}
          </pre>
        )}
        <EquityChart data={equity} height={300} />
      </div>

      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} used={used} limit={limit} />
    </div>
  );
}
