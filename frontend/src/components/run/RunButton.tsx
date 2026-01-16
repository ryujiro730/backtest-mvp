// src/components/run/RunButton.tsx
"use client";

import { buildPayload } from "@/lib/strategy/buildPayload";
import { useRuleStore } from "@/rules/store";

export function RunButton({ onRunStarted }: { onRunStarted: (runId: string) => void }) {
  const rule = useRuleStore((s) => s.rule);

  const onClick = async () => {
    const payload = buildPayload(rule);

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
      let data = {};
      try {
        data = JSON.parse(txt);
      } catch {
        console.error("[RunButton] invalid JSON:", txt);
      }

      const runId = data.run_id ?? null;
      console.log("[RunButton] parsed runId:", runId);

      if (runId) {
        // ★ localStorage に runId を保存
        localStorage.setItem("last_run_id", runId);
        console.log("[RunButton] saved runId =", runId);

        // ★ 呼び出し元へ runId を伝える
        onRunStarted(runId);
      } else {
        console.error("runId not returned", data);
      }
    } catch (e) {
      console.error("[RunButton] exception:", e);
    }
  };

  return <button onClick={onClick}>実行</button>;
}
