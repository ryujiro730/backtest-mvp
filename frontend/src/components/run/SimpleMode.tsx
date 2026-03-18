"use client";

import { useRuleStore } from "@/rules/store";
import { buildPayload } from "@/lib/strategy/buildPayload";
import { makeGoldenCross, makeRsiContrarian, makeBreakout } from "@/lib/strategy/presets";
import type { PresetKey } from "@/lib/strategy/presets";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from "uuid";


const PRESET_CONFIG: {
  key: PresetKey;
  make: () => any;
  icon: string;
  gradient: string;
  btnClass: string;
}[] = [
  {
    key: "goldenCross",
    make: makeGoldenCross,
    icon: "📈",
    gradient: "from-blue-600 to-blue-500",
    btnClass: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
  },
  {
    key: "rsiContrarian",
    make: makeRsiContrarian,
    icon: "🔄",
    gradient: "from-violet-600 to-violet-500",
    btnClass: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800",
  },
  {
    key: "breakout",
    make: makeBreakout,
    icon: "🚀",
    gradient: "from-orange-500 to-amber-500",
    btnClass: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
  },
];

/* ============================================================
   コンポーネント
============================================================ */

export function SimpleMode({
  runningKey,
  onRunStarted,
  showTitle = true,
}: {
  runningKey: PresetKey | null;
  onRunStarted: (runId: string, key: PresetKey) => void;
  showTitle?: boolean;
}) {
  const update = useRuleStore((s) => s.update);
  const t = useTranslations("SimpleMode");

  const runPreset = async (key: PresetKey, make: () => any) => {
    if (runningKey !== null) return;

    const preset = make();
    // ストアを更新（詳細モードに切り替えたとき反映されるよう）
    update(preset);

    // 最新のストア状態とプリセットをマージしてペイロードを構築
    const currentRule = useRuleStore.getState().rule;
    const mergedRule = { ...currentRule, ...preset };
    const payload = buildPayload(mergedRule as any);

    if (!payload.entry || payload.entry.length === 0) {
      console.warn("[SimpleMode] no entry generated for preset:", key);
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
        console.error("[SimpleMode] API error", res.status, data);
        alert(`バックテストの開始に失敗しました (${res.status}): ${data?.error ?? data?.detail ?? "不明なエラー"}`);
        return;
      }
    } catch (e) {
      console.error("[SimpleMode] fetch failed", e);
      alert("サーバーに接続できませんでした。バックエンドが起動しているか確認してください。");
      return;
    }

    if (data?.run_id) {
      localStorage.setItem("last_run_id", data.run_id);
      localStorage.setItem("last_run_pair", preset.meta?.pair ?? "EURUSD");
      localStorage.setItem("last_run_timeframe", preset.meta?.timeframe ?? "H1");

      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "run_backtest_started", {
          run_id: data.run_id,
          pair: preset.meta?.pair,
          timeframe: preset.meta?.timeframe,
          preset: key,
        });
      }

      onRunStarted(data.run_id, key);
    } else {
      console.error("[SimpleMode] run_id not found", data);
      alert(`バックテストを開始できませんでした: ${data?.error ?? "不明なエラー"}`);
    }
  };

  return (
    <div>
      {/* セクションタイトル */}
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
      )}

      {/* プリセットカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_CONFIG.map(({ key, make, icon, gradient, btnClass }) => {
          return (
            <div
              key={key}
              className="flex flex-col rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              {/* カードヘッダー */}
              <div className={`bg-gradient-to-r ${gradient} px-4 py-3 text-white`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="font-bold text-base leading-tight">
                      {t(`${key}.name`)}
                    </div>
                    <div className="text-xs opacity-75 mt-0.5">
                      {t(`${key}.detail`)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 戦略説明 */}
              <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                {t(`${key}.desc`)}
              </div>

              {/* 実行ボタン */}
              <div className="px-4 py-3">
                <button
                  onClick={() => runPreset(key, make)}
                  disabled={runningKey !== null}
                  className={`
                    w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white
                    transition-all duration-150
                    flex items-center justify-center gap-2
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${btnClass}
                  `}
                >
                  {runningKey === key ? (
                    <>
                      <Spinner className="h-3.5 w-3.5 animate-spin" />
                      <span>{t("running")}</span>
                    </>
                  ) : (
                    t("runButton")
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 免責・注記 */}
      <p className="mt-3 text-xs text-slate-400 text-center">
        {t("sampleNote")}
      </p>
    </div>
  );
}
