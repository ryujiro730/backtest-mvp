// frontend/src/components/run/RunPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { RulesBuilder } from "@/rules/RulesBuilder";
import { RunButton } from "@/components/run/RunButton";
import { SimpleMode } from "@/components/run/SimpleMode";
import PaywallDialog from "@/components/billing/PaywallDialog";
import type { PresetKey } from "@/lib/strategy/presets";

const FREE_RUN_LIMIT = 2;
const RUN_COUNT_KEY = "backtest_run_count";

export function RunPanel({ used, premium }: { used: number; premium: boolean }) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [runId, setRunId] = useState<string | null>(null);
  const [uiRunning, setUiRunning] = useState(false);
  const [runningKey, setRunningKey] = useState<PresetKey | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // ローカルで使用回数を管理（サーバーから初期値を受け取り、実行のたびに+1）
  const [localUsed, setLocalUsed] = useState(() => {
    if (typeof window === "undefined") return used;
    const stored = parseInt(localStorage.getItem(RUN_COUNT_KEY) ?? "0", 10);
    // サーバー値とlocalStorageの大きい方を使う
    return Math.max(used, stored);
  });

  // サーバー値が変わったらlocalStorageと同期
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(RUN_COUNT_KEY) ?? "0", 10);
    const synced = Math.max(used, stored);
    setLocalUsed(synced);
    localStorage.setItem(RUN_COUNT_KEY, String(synced));
  }, [used]);

  const router = useRouter();
  const t = useTranslations("AppMode");
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!runId) return;
    if (pollingRef.current) return;
    pollingRef.current = true;

    let alive = true;

    const tick = async () => {
      if (!alive) return;

      try {
        const res = await fetch(`/api/reports/${runId}/summary`, {
          cache: "no-store",
        });

        if (!alive) return;

        if (res.status === 202 || res.status === 404) {
          setTimeout(tick, 1500);
          return;
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("[RunPanel] summary error:", res.status, text.slice(0, 200));
          setTimeout(tick, 1500);
          return;
        }

        const body = await res.json().catch(() => null);
        if (!alive) return;

        if (body?.status && body.status !== "done") {
          setTimeout(tick, 1500);
          return;
        }

        setUiRunning(false);
        setRunningKey(null);
        router.push("/performance" as any);
      } catch (e) {
        console.warn("[RunPanel] polling error:", e);
        setTimeout(tick, 1500);
      }
    };

    tick();

    return () => {
      alive = false;
      pollingRef.current = false;
    };
  }, [runId, router]);

  const handleBeforeRun = (): boolean => {
    if (premium) return true;
    if (localUsed < FREE_RUN_LIMIT) return true;
    setPaywallOpen(true);
    return false;
  };

  const handleRunStarted = (id: string, key?: PresetKey) => {
    const next = localUsed + 1;
    setLocalUsed(next);
    localStorage.setItem(RUN_COUNT_KEY, String(next));
    setUiRunning(true);
    setRunningKey(key ?? null);
    setRunId(id);
  };

  return (
    <>
      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        used={localUsed}
        limit={FREE_RUN_LIMIT}
      />

      {/* モード切り替えタブ */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode("simple")}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
            ${mode === "simple"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }
          `}
        >
          {t("simple")}
        </button>
        <button
          type="button"
          onClick={() => setMode("advanced")}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
            ${mode === "advanced"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }
          `}
        >
          {t("advanced")}
        </button>
      </div>

      {mode === "simple" ? (
        <SimpleMode
          runningKey={runningKey}
          onRunStarted={handleRunStarted}
          onBeforeRun={handleBeforeRun}
        />
      ) : (
        <>
          <RulesBuilder />
          <div className="mt-10 md:mt-12">
            <RunButton
              running={uiRunning}
              onRunStarted={(id) => handleRunStarted(id)}
              onBeforeRun={handleBeforeRun}
            />
          </div>
        </>
      )}
    </>
  );
}
