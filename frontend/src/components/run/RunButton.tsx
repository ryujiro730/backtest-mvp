// src/components/run/RunButton.tsx
"use client";

import { buildPayload } from "@/lib/strategy/buildPayload";
import { useRuleStore } from "@/rules/store";
import { Spinner } from "@/components/ui/spinner";

export function RunButton({
  running,
  onRunStarted,
}: {
  running: boolean;
  onRunStarted: (runId: string) => void;
}) {
  const rule = useRuleStore((s) => s.rule);

const onClick = async () => {
  if (running) return;

  const payload = buildPayload(rule);
  if (!payload.entry || payload.entry.length === 0) {
    alert("エントリー条件を1つ以上設定してください");
    return;
  }

  const res = await fetch("/api/run/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json(); // ← ★ここが起点

  // ★① APIレスポンス確認
  console.log("[RunButton] response =", data);

  if (data?.run_id) {
    // ★② 新 runId の確認
    console.log("[RunButton] new runId =", data.run_id);

    // ★③ localStorage に入れた瞬間の確認
    localStorage.setItem("last_run_id", data.run_id);
    console.log(
      "[RunButton] localStorage last_run_id =",
      localStorage.getItem("last_run_id")
    );

    onRunStarted(data.run_id);
  } else {
    console.error("[RunButton] run_id not found", data);
  }
};


  return (
    <button
      onClick={onClick}
      disabled={running}
      className="flex items-center gap-2"
    >
      {running ? (
        <>
          <Spinner className="h-4 w-4 animate-spin" />
          計算中…
        </>
      ) : (
        "実行"
      )}
    </button>
  );

  
}
