// frontend/src/components/run/RunPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { RulesBuilder } from "@/rules/RulesBuilder";
import { RunButton } from "@/components/run/RunButton";

export function RunPanel() {
  const [runId, setRunId] = useState<string | null>(null);
  const [uiRunning, setUiRunning] = useState(false);

  const router = useRouter();

  // 多重起動防止
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!runId) return;
    if (pollingRef.current) return;
    pollingRef.current = true;

    let alive = true;

    const tick = async () => {
      if (!alive) return;

      try {
        // 完了判定は「summary が取れるか」で十分
        const res = await fetch(`/api/reports/${runId}/summary`, {
          cache: "no-store",
        });

        if (!alive) return;

        // 404 = report_not_ready（まだ結果ファイルがない）
        if (res.status === 404) {
          setTimeout(tick, 1500);
          return;
        }

        // 200以外はログ出して少し待つ
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn(
            "[RunPanel] summary not ready:",
            res.status,
            text.slice(0, 200)
          );
          setTimeout(tick, 1500);
          return;
        }

        // ここに来たら完了（summary.json と equity.json は揃ってる前提）
        await res.json().catch(() => null);

        if (!alive) return;

        // 実行中フラグ解除して遷移
        setUiRunning(false);
        router.push("/performance");
      } catch (e) {
        console.warn("[RunPanel] polling error:", e);
        setTimeout(tick, 1500);
      }
    };

    // すぐ1回目を叩く
    tick();

    return () => {
      alive = false;
      pollingRef.current = false;
    };
  }, [runId, router]);

  return (
    <>
      <RulesBuilder />

      <div className="mt-14 md:mt-16">
        <RunButton
        running={uiRunning}
        onRunStarted={(id) => {
          setUiRunning(true); // 押した瞬間にON
          setRunId(id);
        }}
      />
      </div>
    </>
  );
}
