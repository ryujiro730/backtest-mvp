// src/app/page.tsx
import PageClient from "./PageClient";
import Explanation from "@/components/explanation";
import { RunPanel } from "@/components/run/RunPanel";
import NoticeCard from "@/components/NoticeCard";
import BetaSignupCard from "@/components/BetaSignupCard";
import { ChartVerificationCtaLink } from "@/components/ChartVerificationCta";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

const BASE_URL = "https://delvertrade.com";

function getSoftwareAppJsonLd(locale: string) {
  const isEn = locale === "en";
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Delver",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any (Web Browser)",
    description: isEn
      ? "Free FX and crypto backtest tool in your browser. No sign-up. Historical verification, risk of ruin and expectancy built-in."
      : "ブラウザで動く無料のFX・暗号資産バックテストツール。ログイン不要で過去検証が可能。破産確率・期待値の算出に対応。",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: BASE_URL,
  };
}

const LP_META = {
  ja: {
    title: "【完全無料】FXバックテスト検証ツール | ブラウザで条件を入力して即座にトレード実行 Delver",
    description:
      "FXの過去検証がブラウザで今すぐ無料で始められます。検証のやり方は条件を入力するだけ。MT4不要、ゴールド(XAUUSD)対応。バルサラの破産確率も自動算出。効率的な検証で聖杯探しを卒業しましょう。",
  },
  en: {
    title: "Free FX Backtest Tool | Browser-Based Verification Delver",
    description:
      "Run FX backtests in your browser for free. No MT4, no sign-up. Gold (XAUUSD) supported. Balsara risk of ruin and expectancy calculated automatically.",
  },
} as const;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = LP_META[locale === "en" ? "en" : "ja"];
  return {
    title: meta.title,
    description: meta.description,
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LP" });
  const jsonLd = getSoftwareAppJsonLd(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />

      {/* --- 即時体験セクション（アプリ本体） --- */}
      <section id="try" className="py-12 md:py-16 border-b border-slate-200/60 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-8 mb-6 items-start">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">TRY THE ENGINE</h2>
              <p className="text-slate-600">{t("TryEngine.subtitle")}</p>
              <p className="mt-1 text-sm text-slate-500">{t("TryEngine.engineCopy")}</p>
            </div>
            <div className="flex justify-center md:justify-end min-w-0 max-w-sm md:max-w-none md:w-72 mx-auto md:mx-0">
              <BetaSignupCard />
            </div>
          </div>

          <div className="mb-6">
            <NoticeCard />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-sm">
            <RunPanel />
          </div>

          <div className="mt-12 md:mt-14 flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-medium text-amber-700/90">{t("ManualVerify.label")}</p>
            <ChartVerificationCtaLink href={`/${locale}/chart`} variant="manual">
              {t("ManualVerify.cta")}
            </ChartVerificationCtaLink>
          </div>
        </div>
      </section>

      {/* 使い方（STEP形式）・HowTo SEO */}
      <Explanation />

      <PageClient />
    </div>
  );
}