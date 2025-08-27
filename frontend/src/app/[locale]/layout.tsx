import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { locales }from "@/i18n"

export function generateStaticParams() {
    return locales.map((l) => ({ locale: l }));
}

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: ReactNode;
    params: { locale: "en" | "ja" };
}) {
    setRequestLocale(locale);
    const messages = await getMessages();
    return<NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}