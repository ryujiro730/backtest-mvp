"use client";

import { useState, useEffect } from "react";
import { PerformanceHeader } from "@/components/PerformanceHeader";
import { PerformanceContent } from "@/components/PerformanceContent";
import { PerformanceSidebar } from "@/components/PerformanceSidebar";
import type { PerformanceRaw } from "@/lib/performance/transform";

export default function PerformancePage() {
  const [tab, setTab] = useState<
    "overview" | "returns" | "hour" | "heatmap" | "streak"
  >("overview");

  const [data, setData] = useState<PerformanceRaw | null>(null);

useEffect(() => {
  const runId = localStorage.getItem("last_run_id");
  console.log("PerformancePage runId =", runId);

  if (!runId) {
    console.warn("No runId in localStorage");
    return;
  }

  fetch(`/api/reports/${runId}`)
    .then(r => r.json())
    .then(json => {
      console.log("report json", json);
      setData(json);
    })
    .catch(console.error);
}, []);




  return (
    <>
      <PerformanceHeader />
      <div className="flex flex-1 overflow-hidden">
        <PerformanceSidebar current={tab} onChange={setTab} />

        <main className="flex-1 overflow-auto p-6 bg-background">
          <PerformanceContent tab={tab} data={data} />
        </main>
      </div>
    </>
  );
}
