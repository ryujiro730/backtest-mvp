import React, { useEffect, useMemo, useState } from "react";
import Results from "./Results/Results";
import Section from "./Form/Section";
import Field from "./Form/Field";
import NumberField from "./Form/NumberField";

const API = (import.meta as any).env?.VITE_API_BASE || "";

type Direction = "long" | "short";
type EntryType = "ema_cross" | "breakout" | "rsi_threshold";
type RsiEvent = "cross_up" | "cross_down";
type EquityPoint = { t: number; e: number };
type Catalog = { pairs: string[]; timeframes: string[]; items: {pair:string; timeframe:string; dataset_hash:string}[] };

function genIdemKey() { return `fe-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export default function MainApp() {
  // --- catalog ---
  const [catalog, setCatalog] = useState<Catalog>({ pairs: [], timeframes: [], items: [] });
  const [catalogError, setCatalogError] = useState<string|null>(null);
  const hasCatalog = catalog.pairs.length>0 && catalog.timeframes.length>0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/catalog`);
        if (!res.ok) throw new Error(`GET /api/catalog ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCatalog({
          pairs: data?.pairs ?? [], timeframes: data?.timeframes ?? [], items: data?.items ?? []
        });
      } catch (e:any) {
        if (!cancelled) { setCatalog({pairs:[],timeframes:[],items:[]}); setCatalogError(e?.message||String(e)); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // --- state ---
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  useEffect(() => {
    if (catalog.pairs.length) setPair(p => catalog.pairs.includes(p) ? p : catalog.pairs[0]);
    if (catalog.timeframes.length) setTimeframe(tf => catalog.timeframes.includes(tf) ? tf : catalog.timeframes[0]);
  }, [catalog.pairs, catalog.timeframes]);

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
  const [runId, setRunId] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [equity, setEquity] = useState<EquityPoint[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // --- payload ---
  const payload = useMemo(() => {
    const breakoutSide = direction === "short" ? "down" : "up";
    const base:any = { pair, timeframe, direction, fee_bps: feeBps, slippage_bps: slipBps, entry: [], exit: {} };
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
        method:"POST", headers: {"Content-Type":"application/json","Idempotency-Key": genIdemKey()}, body: JSON.stringify(payload)
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`POST /api/run ${res.status}: ${text}`);
      const { run_id } = JSON.parse(text);
      setRunId(run_id);
      await poll(run_id);
    } catch (e:any) { setError(e?.message??String(e)); } finally { setRunning(false); }
  }
  async function poll(id:string){
    const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
    for (let i=0;i<120;i++){
      const res = await fetch(`${API}/api/reports/${id}`);
      if(res.status===202){ await sleep(1000); continue; }
      const text = await res.text();
      if(res.status!==200) throw new Error(`GET /api/reports/${id} ${res.status}: ${text}`);
      const data = JSON.parse(text);
      setSummary(data.summary??null); setEquity(Array.isArray(data.equity)?data.equity:[]); return;
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
    <div className="px-1">
      {/* ここに既存のUI（Section/Field等）— 省略 — */}
      <div className="flex gap-3 items-center mb-4">
        <button className="px-4 py-2 rounded-2xl bg-black text-white disabled:opacity-50" onClick={handleRun} disabled={running || !hasCatalog}>
          {running ? "Running..." : "Run"}
        </button>
        {runId && <span className="text-sm text-gray-600">run_id: {runId}</span>}
        {/* エラー表示 */}
      </div>
      <Results equity={equity} summary={summary} />
    </div>
  );
}

