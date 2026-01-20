// frontend/src/app/app/performance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PerformanceHeader } from "@/components/PerformanceHeader";
import { PerformanceContent } from "@/components/PerformanceContent";
import { PerformanceSidebar } from "@/components/PerformanceSidebar";
import type { PerformanceRaw } from "@/lib/performance/transform";
import { PerformanceTabsMobile } from "@/components/PerformanceTabsMobile";

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


  const [data, setData] = useState<PerformanceRaw | null>(null);

useEffect(() => {
  const runId = localStorage.getItem("last_run_id");
  console.log("[PerformancePage] using runId =", runId);

  if (!runId) return;


  fetch(`/api/reports/${runId}`)
    .then(r => r.json())
    .then(json => {
      console.log(
        "[PerformancePage] fetched summary =",
        json.summary
      );
      setData(json);
    });
}, []);



  return (
    <>
      <PerformanceHeader />
<div className="flex flex-1 overflow-hidden">
  {/* PCのみ：サイドバー */}
  <PerformanceSidebar current={tab} onChange={setTab} />

  {/* メイン領域 */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* スマホのみ：上部タブ */}
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
