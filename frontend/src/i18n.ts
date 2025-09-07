// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en','ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

const loaders = {
  lp: {
    en: () => import('./messages/en/lp.json').then(m => m.default),
    ja: () => import('./messages/ja/lp.json').then(m => m.default),
  },
  paywall: {
    en: () => import('./messages/en/paywall.json').then(m => m.default),
    ja: () => import('./messages/ja/paywall.json').then(m => m.default),
  },
  // ここに account, app など増やしてOK
} as const;

export default getRequestConfig(async ({locale}) => {
  const l: Locale =
    (locales as readonly string[]).includes(locale ?? '')
      ? (locale as Locale)
      : defaultLocale;

  // すべてのローダーを走らせて {lp, paywall, ...} 形にまとめる
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([ns, byLocale]) => {
      // @ts-expect-error — byLocale のキーは 'en' | 'ja'
      const data = await byLocale[l]();
      return [ns, data] as const;
    })
  );

  const messages = Object.fromEntries(entries);

  return { locale: l, messages };
});
