"use client";

import { useState } from "react";
import { PerformanceHeader } from "@/components/PerformanceHeader";
import { PerformanceContent } from "@/components/PerformanceContent";
import { PerformanceSidebar } from "@/components/PerformanceSidebar";

export default function PerformancePage() {
  const [tab, setTab] = useState<
    "overview" | "returns" | "hour" | "heatmap" | "streak"
  >("overview");

  return (
    <>
      {/* 上：ヘッダー（横100%） */}
      <PerformanceHeader />

      {/* 下：サイドバー + メイン */}
      <div className="flex flex-1 overflow-hidden">
        <PerformanceSidebar current={tab} onChange={setTab} />

        <main className="flex-1 overflow-auto p-6 bg-background">
          <PerformanceContent tab={tab} />
        </main>
      </div>
    </>
  );
}
