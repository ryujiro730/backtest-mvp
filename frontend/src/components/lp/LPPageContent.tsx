import PageClient from "@/app/[locale]/PageClient";
import { getSoftwareAppJsonLd } from "@/lib/lp-jsonld";

export { getSoftwareAppJsonLd };

export const LP_META = {
  ja: {
    title:
      "【完全無料】FX・仮想通貨バックテスト検証ツール | ブラウザで条件を入力して即座にトレード実行 Delver",
    description:
      "FX・仮想通貨（BTC・ETH）の過去検証がブラウザで今すぐ無料で始められます。検証のやり方は条件を入力するだけ。MT4不要、ゴールド(XAUUSD)対応。バルサラの破産確率も自動算出。効率的な検証で聖杯探しを卒業しましょう。",
  },
  en: {
    title: "Free FX & Crypto Backtest Tool | Browser-Based Verification Delver",
    description:
      "Run FX and crypto (BTC, ETH) backtests in your browser for free. No MT4, no sign-up. Gold (XAUUSD) supported. Balsara risk of ruin and expectancy calculated automatically.",
  },
} as const;

type Props = { locale: string };

export default function LPPageContent({ locale }: Props) {
  const jsonLd = getSoftwareAppJsonLd(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, "<\\/script>"),
        }}
      />
      <PageClient locale={locale} />
    </div>
  );
}
