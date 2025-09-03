'use client';

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Line, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush, ReferenceLine
} from "recharts";
import "./polish.css";
const API = process.env.NEXT_PUBLIC_API_BASE!;
import mixpanel from "mixpanel-browser";
type Direction = "long" | "short";
type EntryType = "ema_cross" | "breakout" | "rsi_threshold";
type RsiEvent = "cross_up" | "cross_down";
type EquityPoint = { t: number; e: number };
type Catalog = { pairs: string[]; timeframes: string[]; items: {pair:string; timeframe:string; dataset_hash:string}[] };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 border mb-4 shadow-sm">
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </label>
  );
}
function NumberField(props: { value: number; onChange: (n: number) => void; integer?: boolean; className?: string; min?: number; max?: number; disabled?: boolean; }) {
  const { value, onChange, integer, className, min, max } = props;
  const [raw, setRaw] = useState(String(value));
  useEffect(() => setRaw(String(value)), [value]);
  return (
    <input
      type="text" className={className}
      inputMode={integer ? "numeric" : "decimal"}
      pattern={integer ? "[0-9]*" : "[0-9]*[.]?[0-9]*"}
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => {
        if (raw.trim() === "") { setRaw(String(value)); return; }
        let n = Number(raw); if (!Number.isFinite(n)) { setRaw(String(value)); return; }
        if (integer) n = Math.floor(n);
        if (typeof min === "number") n = Math.max(min, n);
        if (typeof max === "number") n = Math.min(max, n);
        onChange(n); setRaw(String(n));
      }}
    />
  );
}

function genIdemKey() { return `fe-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export default function App() {
  // === Catalog (null-safe 初期値) ===
  const [catalog, setCatalog] = useState<Catalog>({ pairs: [], timeframes: [], items: [] });
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const hasCatalog = catalog.pairs.length > 0 && catalog.timeframes.length > 0;
  useEffect(() => {
    mixpanel.init("564958c137c3bab43e6332b7aab074e5", { debug: true });
    mixpanel.track("Page Viewed", { page: "App" });
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/catalog`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`GET /api/catalog ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCatalog({
          pairs: Array.isArray(data?.pairs) ? data.pairs : [],
          timeframes: Array.isArray(data?.timeframes) ? data.timeframes : [],
          items: Array.isArray(data?.items) ? data.items : [],
        });
      } catch (e: any) {
        if (!cancelled) {
          setCatalog({ pairs: [], timeframes: [], items: [] });
          setCatalogError(e?.message ?? String(e));
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 既定はカタログの先頭（無ければダミー）
  const [pair, setPair] = useState<string>("EURUSD");
  const [timeframe, setTimeframe] = useState<string>("H1");

  // カタログが変わったら選択を合わせる（存在しなければ先頭へ）
  useEffect(() => {
    if (catalog.pairs.length > 0) {
      setPair(prev => catalog.pairs.includes(prev) ? prev : catalog.pairs[0]);
    }
    if (catalog.timeframes.length > 0) {
      setTimeframe(prev => catalog.timeframes.includes(prev) ? prev : catalog.timeframes[0]);
    }
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

  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [equity, setEquity] = useState<EquityPoint[]>([]);
  const [summary, setSummary] = useState<any>(null);


// === Add UI state ===
const [useTimeStop, setUseTimeStop]   = useState(true);
const [useSLATR, setUseSLATR]         = useState(true);     // 初期SL (sl_atr)
const [useTrailing, setUseTrailing]   = useState(true);
const [trailingMode, setTrailingMode] = useState<"breakeven"|"atr">("breakeven");


  const payload = useMemo(() => {
    const breakoutSide = direction === "short" ? "down" : "up";
    const base: any = {
      pair, timeframe,
      direction,
      fee_bps: feeBps, slippage_bps: slipBps,
      entry: [], exit: {},
    };
    if (timeStopBars > 0) base.exit.time_stop_bars = { bars: Math.floor(timeStopBars) };
    if (trailRRToBE > 0) base.exit.trailing = { mode: "breakeven", rr_to_breakeven: Number(trailRRToBE) };

    if (entryType === "ema_cross") base.entry=[{type:"ema_cross", fast:Math.floor(emaFast), slow:Math.floor(emaSlow), cross:"above"}];
    else if (entryType === "breakout") base.entry=[{type:"breakout", lookback:Math.floor(brkLookback), side:breakoutSide}];
    else if (entryType === "rsi_threshold") base.entry=[{type:"rsi_threshold", length:Math.floor(rsiLen), level:Number(rsiLevel), event:rsiEvent}];

    return base;
  }, [pair,timeframe,direction,feeBps,slipBps,timeStopBars,trailRRToBE,entryType,emaFast,emaSlow,brkLookback,rsiLen,rsiLevel,rsiEvent]);

  async function handleRun() {
    setError(null); setEquity([]); setSummary(null); setRunning(true); setRunId(null);
    try {
      if (!hasCatalog) throw new Error("No datasets registered. Check /api/catalog and MinIO indexes.");
      const res = await fetch(`${API}/api/run`, {
        method:"POST",
        headers: {"Content-Type":"application/json","Idempotency-Key": genIdemKey()},
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`POST /api/run ${res.status}: ${text}`);
      const { run_id } = JSON.parse(text);
      setRunId(run_id);
      await poll(run_id);
    } catch(e:any){ setError(e?.message??String(e)); } finally { setRunning(false); }
  }
  async function poll(id:string){
    const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
    for (let i=0;i<120;i++){
      const res = await fetch(`${API}/api/reports/${id}`);
      if(res.status===202){ await sleep(1000); continue; }
      const text = await res.text();
      if(res.status!==200) throw new Error(`GET /api/reports/${id} ${res.status}: ${text}`);
      const data = JSON.parse(text);
      setSummary(data.summary??null);
      setEquity(Array.isArray(data.equity)?data.equity:[]);
      return;
    }
    throw new Error("timeout");
  }

  const PairSelect = (
    <select className="mt-1 p-2 rounded-xl border" value={pair} onChange={(e)=>setPair(e.target.value)} disabled={!hasCatalog}>
      {hasCatalog ? catalog.pairs.map(p => <option key={p} value={p}>{p}</option>) : <option>—</option>}
    </select>
  );
  const TfSelect = (
    <select className="mt-1 p-2 rounded-xl border" value={timeframe} onChange={(e)=>setTimeframe(e.target.value)} disabled={!hasCatalog}>
      {hasCatalog ? catalog.timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>) : <option>—</option>}
    </select>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Backtest MVP</h1>

      {!hasCatalog && (
        <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-xl border">
          {catalogError ? `Catalog load failed: ${catalogError}` : "Loading catalog or no datasets found. Check /api/catalog and MinIO index."}
        </div>
      )}

      <Section title="基本設定">
        <Field label="Pair">{PairSelect}</Field>
        <Field label="Timeframe">{TfSelect}</Field>
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
      <NumberField className="mt-1 p-2 rounded-xl border flex-1"
                   integer value={timeStopBars} onChange={setTimeStopBars} min={1} disabled={!useTimeStop}/>
    </div>
  </Field>

  <Field label="Initial SL (ATR x)">
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={useSLATR} onChange={e=>setUseSLATR(e.target.checked)} />
      <NumberField className="mt-1 p-2 rounded-xl border flex-1"
                   value={trailAtr} onChange={setTrailAtr} min={0} disabled={!useSLATR}/>
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

      <Results equity={equity} summary={summary} />
    </div>
  );
}

function Results({ equity, summary }: { equity: any[]; summary: any }) {
  return (
    <div className="rounded-2xl border p-4">
      <h2 className="font-semibold mb-3">Results</h2>
      {summary && (
        <pre className="text-xs bg-gray-50 p-2 rounded-xl overflow-auto mb-4">
          {JSON.stringify(summary, null, 2)}
        </pre>
      )}
      <EquityChart data={equity} height={300} />
    </div>
  );
}

function EquityChart({ data, height = 300 }: { data: any[]; height?: number }) {
  const toNum = (v: any) => {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    const n = Number(v); if (Number.isFinite(n)) return n;
    const ms = Date.parse(String(v)); return Number.isFinite(ms) ? ms : NaN;
  };

  const pointsRaw = Array.isArray(data) ? data : [];
  const pts = pointsRaw
    .map((d: any) => ({ t: toNum(d?.t ?? d?.[0]), e: toNum(d?.e ?? d?.[1]) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.e))
    .sort((a, b) => a.t - b.t);
  if (pts.length === 0) return <div className="text-sm text-gray-500">No equity data.</div>;

  const base = pts[0].e;
  const chartData = pts.map((p) => ({ x: p.t, equity: p.e, pnl: p.e - base }));
  const xmin = chartData[0].x, xmax = chartData[chartData.length - 1].x;
  const fmtDate = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  const [mode, setMode] = React.useState<"equity"|"pnl">("pnl");
  const yKey = mode === "pnl" ? "pnl" : "equity";
  const yLabel = mode === "pnl" ? "PnL (Δ from start)" : "Equity";

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">View:</span>
        <button className={`px-2 py-1 rounded-md border ${mode==="pnl"?"bg-black text-white":""}`} onClick={()=>setMode("pnl")}>PnL</button>
        <button className={`px-2 py-1 rounded-md border ${mode==="equity"?"bg-black text-white":""}`} onClick={()=>setMode("equity")}>Equity</button>
        <span className="ml-auto text-xs text-gray-500">n={chartData.length}</span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <defs>
            <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={[xmin, xmax]} tickFormatter={fmtDate} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: any) => Number(v).toFixed(2)} label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 10 }} />
          <Tooltip labelFormatter={(ms) => fmtDate(Number(ms))} formatter={(val: any, name: string) => [Number(val).toFixed(4), name]} />
          <Legend />
          {mode==="pnl" ? <ReferenceLine y={0} stroke="currentColor" strokeDasharray="3 3" /> : <ReferenceLine y={base} stroke="currentColor" strokeDasharray="3 3" />}
          <Area type="monotone" dataKey={yKey} fill="url(#gradArea)" stroke="none" />
          <Line type="monotone" dataKey={yKey} strokeWidth={2} dot={false} isAnimationActive />
          <Brush dataKey="x" height={24} stroke="currentColor" travellerWidth={8} tickFormatter={fmtDate} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
