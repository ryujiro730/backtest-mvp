// frontend/src/components/run/RunPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { RulesBuilder } from "@/rules/RulesBuilder";
import { RunButton } from "@/components/run/RunButton";

export function RunPanel() {
  const [runId, setRunId] = useState<string | null>(null);
  const [uiRunning, setUiRunning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!runId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/reports/${runId}`);
      const json = await res.json();

      const isCompleted =
        Array.isArray(json?.equity) &&
        json.equity.length > 0 &&
        Array.isArray(json?.trades);

      if (!isCompleted) return;

      clearInterval(interval);
      router.push("/app/performance");
    }, 1500);

    return () => clearInterval(interval);
  }, [runId, router]);

  return (
    <>
      <RulesBuilder />

      <RunButton
        running={uiRunning}
        onRunStarted={(id) => {
          setUiRunning(true); // ★ 押した瞬間にON
          setRunId(id);
        }}
      />
    </>
  );
}
