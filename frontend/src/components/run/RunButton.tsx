// src/components/run/RunButton.tsx
"use client";

import { buildPayload } from "@/lib/strategy/buildPayload";
import { useRuleStore } from "@/rules/store";

export function RunButton({
  onRunStarted,
}: {
  onRunStarted: (runId: string) => void;
}) {
  const rule = useRuleStore((s) => s.rule);

  const onClick = async () => {
    const payload = buildPayload(rule);

    // エントリーなしは実行させない
    if (!payload.entry || payload.entry.length === 0) {
      alert("エントリー条件を1つ以上設定してください");
      return;
    }

    try {
      const res = await fetch("/api/run/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      console.log("[RunButton] raw response:", txt);

      if (!res.ok) {
        console.error("[RunButton] /api/run/start failed:", txt);
        return;
      }

      const data = JSON.parse(txt);
      const runId = data.run_id ?? data.id ?? null;

      console.log("[RunButton] parsed runId:", runId);

      if (runId) {
        onRunStarted(runId);
      } else {
        console.error("runId not returned:", data);
      }
    } catch (e) {
      console.error("[RunButton] exception:", e);
    }
  };

  return <button onClick={onClick}>実行</button>;
}
