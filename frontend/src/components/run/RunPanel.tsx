"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { RulesBuilder } from "@/rules/RulesBuilder";
import { RunButton } from "@/components/run/RunButton";
import { SimpleMode } from "@/components/run/SimpleMode";
import type { PresetKey } from "@/lib/strategy/presets";

export function RunPanel() {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [runId, setRunId] = useState<string | null>(null);
  const [uiRunning, setUiRunning] = useState(false);
  const [runningKey, setRunningKey] = useState<PresetKey | null>(null);

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

  const handleRunStarted = (id: string, key?: PresetKey) => {
    setUiRunning(true);
    setRunningKey(key ?? null);
    setRunId(id);
  };

  return (
    <>
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
          onBeforeRun={() => true}
        />
      ) : (
        <>
          <RulesBuilder />
          <div className="mt-10 md:mt-12">
            <RunButton
              running={uiRunning}
              onRunStarted={(id) => handleRunStarted(id)}
              onBeforeRun={() => true}
            />
          </div>
        </>
      )}
    </>
  );
}
