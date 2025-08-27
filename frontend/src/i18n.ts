import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ja";

const dict: Record<Locale, () => Promise<any>> = {
  en: () => import("./messages/en.json").then((m) => m.default),
  ja: () => import("./messages/ja.json").then((m) => m.default),
};

export default getRequestConfig(async ({ locale }) => {
  const l =
    (locales as readonly string[]).includes(locale ?? "") ? (locale as Locale) : defaultLocale;
  return { locale: l, messages: await dict[l]() };
});
