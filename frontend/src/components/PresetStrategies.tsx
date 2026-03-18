"use client";

import { useRuleStore } from "@/rules/store";
import { useTranslations } from "next-intl";
import { PRESETS } from "@/lib/strategy/presets";

/* ============================================================
   コンポーネント
============================================================ */

export function PresetStrategies() {
  const update = useRuleStore((s) => s.update);
  const t = useTranslations("PresetStrategies");

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {t("label")}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ key, make }) => (
          <button
            key={key}
            type="button"
            onClick={() => update(make())}
            className="
              group flex flex-col items-start gap-0.5
              rounded-lg border border-slate-200 bg-white px-3 py-2
              text-left text-sm shadow-sm
              transition-all duration-150
              hover:border-blue-400 hover:bg-blue-50 hover:shadow-md
              active:scale-[0.97]
              dark:border-slate-700 dark:bg-slate-800
              dark:hover:border-blue-500 dark:hover:bg-blue-950/40
            "
          >
            <span className="font-semibold text-slate-800 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
              {t(`${key}.name`)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(`${key}.desc`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
