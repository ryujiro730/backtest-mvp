const BASE_URL = "https://delvertrade.com";

export function getSoftwareAppJsonLd(locale: string) {
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
