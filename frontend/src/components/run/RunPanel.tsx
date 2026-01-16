"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { RulesBuilder } from "@/rules/RulesBuilder";
import { RunButton } from "@/components/run/RunButton";
import { RunResult } from "@/components/run/RunResult";

export function RunPanel() {
  const [runId, setRunId] = useState<string | null>(null);
  const router = useRouter();

  console.log("RunPanel runId =", runId);

  // ★★★★★ ポーリング関数（内部で定義）
  async function pollUntilComplete(runId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reports/${runId}`);
        const json = await res.json();

        console.log("[poll]", json);

        // 完了条件：equity が返り始めたら
        if (json?.equity && json.equity.length > 0) {
          clearInterval(interval);

          console.log("Backtest complete. Navigating...");
          router.push("/app/performance");  // ★ 自動遷移！
        }
      } catch (e) {
        console.error("[poll error]", e);
      }
    }, 1500);
  }

  // ★★★★★ runId がセットされた瞬間にポーリング開始
  useEffect(() => {
    if (runId) {
      console.log("Starting poll for runId =", runId);
      pollUntilComplete(runId);
    }
  }, [runId]);

  return (
    <>
      {/* エントリー条件の UI */}
      <RulesBuilder />

      {/* 実行ボタン：runId を RunPanel に渡す */}
      <RunButton onRunStarted={setRunId} />

      {/* 実行中の状態表示（任意） */}
      <RunResult runId={runId} />
    </>
  );
}
