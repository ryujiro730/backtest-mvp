import { setRequestLocale } from "next-intl/server";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import LPPageContent, { LP_META } from "@/components/lp/LPPageContent";
import { LocaleLangSync } from "@/components/LocaleLangSync";
import { Metadata } from "next";

const BASE = "https://delvertrade.com";

export const metadata: Metadata = {
  title: LP_META.ja.title,
  description: LP_META.ja.description,
  robots: "index, follow",
  metadataBase: new URL(BASE),
  alternates: {
    canonical: `${BASE}/`,
    languages: {
      ja: `${BASE}/ja`,
      en: `${BASE}/en`,
      "x-default": `${BASE}/`,
    },
  },
};

export default async function RootPage() {
  setRequestLocale("ja");
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale="ja" messages={messages}>
      <LocaleLangSync />
      <LPPageContent locale="ja" />
    </NextIntlClientProvider>
  );
}
