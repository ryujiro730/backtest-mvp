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

  const [summary, setSummary] = useState<any | null>(null);
  const [equity, setEquity] = useState<any[] | null>(null);
  const [trades, setTrades] = useState<any[] | null>(null);

  const [data, setData] = useState<PerformanceRaw | null>(null);

  useEffect(() => {
    const runId = localStorage.getItem("last_run_id");
    if (!runId) return;

    // ① summary（軽い）
    fetch(`/api/reports/${runId}/summary`, { cache: "no-store" })
      .then(r => r.json())
      .then(s => {
        console.log("[PerformancePage] summary loaded");
        setSummary(s);
      });

    // ② equity（重い）
    setTimeout(() => {
      fetch(`/api/reports/${runId}/equity`, { cache: "no-store" })
        .then(r => r.json())
        .then(eq => {
          console.log("[PerformancePage] equity loaded");
          setEquity(eq);
        });
    }, 0);

    // ③ trades（中）
    fetch(`/api/reports/${runId}/trades`, { cache: "no-store" })
      .then(r => r.json())
      .then(t => {
        console.log("[PerformancePage] trades loaded");
        setTrades(t);
      });
  }, []);

  // ✅ これだけ残す（統合は1回だけ）
  useEffect(() => {
    if (!summary || !equity || !trades) return;

    const merged: PerformanceRaw = {
      summary: summary.summary,
      stats: summary.stats,
      equity,
      trades,
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
            <PerformanceContent tab={tab} data={data} />
          </main>
        </div>
      </div>
    </>
  );
}
