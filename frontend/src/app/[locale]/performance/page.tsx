// frontend/src/app/app/performance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PerformanceHeader } from "@/components/PerformanceHeader";
import { PerformanceContent } from "@/components/PerformanceContent";
import { PerformanceSidebar } from "@/components/PerformanceSidebar";
import { PerformanceTabsMobile } from "@/components/PerformanceTabsMobile";
import type { PerformanceRaw } from "@/lib/performance/transform";

export default function PerformancePage() {
  const [tab, setTab] = useState<
    | "overview"
    | "returns"
    | "hour"
    | "heatmap"
    | "duration"
    | "streak"
    | "equity"
  >("overview");

  const [runId, setRunId] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [equity, setEquity] = useState<any[] | null>(null);
  const [trades, setTrades] = useState<any[] | null>(null);

  const [data, setData] = useState<PerformanceRaw | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("last_run_id");
    if (!id) return;
    setRunId(id);

    let alive = true;

    // 202 が返る間はリトライするフェッチ
    async function pollUntilReady(url: string): Promise<any> {
      for (;;) {
        if (!alive) return null;
        const res = await fetch(url, { cache: "no-store" });
        if (res.status === 202) {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
        const body = await res.json();
        // body レベルの status が done 以外なら待つ
        if (body?.status && body.status !== "done") {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        return body;
      }
    }

    // ① summary
    pollUntilReady(`/api/reports/${id}/summary`)
      .then(s => {
        if (!alive) return;
        console.log("[PerformancePage] summary loaded");
        setSummary(s);
      })
      .catch(e => console.error("[PerformancePage] summary error", e));

    // ② equity
    pollUntilReady(`/api/reports/${id}/equity`)
      .then(eq => {
        if (!alive) return;
        console.log("[PerformancePage] equity loaded");
        setEquity(eq);
      })
      .catch(e => console.error("[PerformancePage] equity error", e));

    // ③ trades
    pollUntilReady(`/api/reports/${id}/trades`)
      .then(t => {
        if (!alive) return;
        console.log("[PerformancePage] trades loaded");
        setTrades(Array.isArray(t) ? t : Array.isArray(t?.trades) ? t.trades : []);
      })
      .catch(() => { if (alive) setTrades([]); });

    return () => { alive = false; };
  }, []);

  // ✅ これだけ残す（統合は1回だけ）
  useEffect(() => {
    if (!summary || !equity || trades === null) return;

    const tradesList = Array.isArray(trades) ? trades : [];
    const merged: PerformanceRaw = {
      summary: summary?.summary ?? { pf: 0, winrate: 0, maxdd: 0, trades: 0 },
      equity: Array.isArray(equity) ? equity : [],
      trades: tradesList,
    };

    setData(merged);
  }, [summary, equity, trades]);

  return (
    <>
      <PerformanceHeader />

      <div className="flex flex-1 overflow-hidden">
        <PerformanceSidebar current={tab} onChange={setTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <PerformanceTabsMobile
            current={tab}
            onChange={setTab}
          />

          <main className="flex-1 overflow-auto p-6 bg-background">
            <PerformanceContent tab={tab} data={data} runId={runId} />
          </main>
        </div>
      </div>
    </>
  );
}
