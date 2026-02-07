"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useParams } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const toggleLocale = () => {
    const nextLocale = locale === "ja" ? "en" : "ja";
    // @ts-ignore
    router.replace({ pathname, params }, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-sm font-semibold transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
    >
      <span className={locale === "ja" ? "text-emerald-600" : "text-slate-400"}>
        JP
      </span>
      <span className="text-slate-300 font-light">|</span>
      <span className={locale === "en" ? "text-emerald-600" : "text-slate-400"}>
        EN
      </span>
    </button>
  );
}