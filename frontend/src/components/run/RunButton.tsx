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

    let data: any;
    try {
      const res = await fetch("/api/run/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": uuidv4(),
        },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (!res.ok) {
        console.error("[RunButton] API error", res.status, data);
        alert(`バックテストの開始に失敗しました (${res.status}): ${data?.error ?? data?.detail ?? "不明なエラー"}`);
        return;
      }
    } catch (e) {
      console.error("[RunButton] fetch failed", e);
      alert("サーバーに接続できませんでした。バックエンドが起動しているか確認してください。");
      return;
    }

    if (data?.run_id) {
      localStorage.setItem("last_run_id", data.run_id);
      localStorage.setItem("last_run_pair", rule.meta.pair);
      localStorage.setItem("last_run_timeframe", rule.meta.timeframe);
      onRunStarted(data.run_id);
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "run_backtest_started", {
          run_id: data.run_id,
          pair: rule.meta.pair,
          timeframe: rule.meta.timeframe,
        });
      }
    } else {
      console.error("[RunButton] run_id not found", data);
      alert(`バックテストを開始できませんでした: ${data?.error ?? "不明なエラー"}`);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={running}
      className="
        w-full flex items-center justify-center gap-2
        px-8 py-4
        text-sm font-bold text-white uppercase tracking-widest
        rounded-xl
        bg-blue-600 hover:bg-blue-700
        shadow-[0_2px_12px_rgba(37,99,235,0.25)]
        hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-70 disabled:cursor-not-allowed
      "
    >
      {running ? (
        <>
          <Spinner className="h-4 w-4 animate-spin" />
          <span>{t("running")}</span>
        </>
      ) : (
        t("run")
      )}
    </button>
  );
}
