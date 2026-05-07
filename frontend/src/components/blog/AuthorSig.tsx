"use client";

import { useTranslations } from "next-intl";

export default function AuthorSig() {
  const t = useTranslations("AuthorSig");

  return (
    <aside className="mt-16 border-y border-slate-200 py-10">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Avatar placeholder */}
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <span className="text-2xl text-emerald-600 font-bold select-none">D</span>
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
              {t("label")}
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {t("nameJa")}
            </h3>
          </div>

          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 max-w-2xl font-sans">
            {t("description")}
          </p>
        </div>
      </div>
    </aside>
  );
}