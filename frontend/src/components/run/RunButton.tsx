// src/components/run/RunButton.tsx
"use client";

import { buildPayload } from "@/lib/strategy/buildPayload";
import { useRuleStore } from "@/rules/store";
import { Spinner } from "@/components/ui/spinner";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";

export function RunButton({
  running,
  onRunStarted,
}: {
  running: boolean;
  onRunStarted: (runId: string) => void;
}) {
  const rule = useRuleStore((s) => s.rule);
  const t = useTranslations("RunButton");

  const onClick = async () => {
    if (running) return;

    const payload = buildPayload(rule);
    if (!payload.entry || payload.entry.length === 0) {
      alert(t("noEntry"));
      return;
    }

    const res = await fetch("/api/run/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": uuidv4(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log("[RunButton] response =", data);

    if (data?.run_id) {
      console.log("[RunButton] new runId =", data.run_id);
      localStorage.setItem("last_run_id", data.run_id);
      localStorage.setItem("last_run_pair", rule.meta.pair);
      localStorage.setItem("last_run_timeframe", rule.meta.timeframe);
      onRunStarted(data.run_id);
    } else {
      console.error("[RunButton] run_id not found", data);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={running}
      className={`
        relative z-10 overflow-hidden
        flex items-center justify-center gap-2
        px-10 py-4
        text-lg font-bold text-white
        rounded-full

        bg-gradient-to-b
        from-red-400
        via-red-500
        to-red-700

        shadow-[
          0_3px_0_rgba(127,29,29,0.45),
          0_12px_30px_rgba(0,0,0,0.12)
        ]

        transition-all duration-150
        hover:brightness-110
        active:translate-y-[4px]
        active:shadow-[
          0_2px_0_rgba(127,29,29,0.6),
          0_6px_12px_rgba(0,0,0,0.2)
        ]

        focus:outline-none
        focus:ring-0
        focus-visible:outline-none

        disabled:opacity-80
        disabled:cursor-not-allowed
        disabled:active:translate-y-0
      `}
    >
      {/* 上ハイライト */}
      <span
        className="
          pointer-events-none
          absolute inset-x-1 top-1 h-1/2
          rounded-full
          bg-gradient-to-b
          from-white/50
          to-transparent
        "
      />

      {/* 中身 */}
      <span className="relative z-10 flex items-center gap-2">
        {running ? (
          <>
            <Spinner className="h-4 w-4 animate-spin" />
            {t("running")}
          </>
        ) : (
          t("run")
        )}
      </span>
    </button>
  );
}
