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
} as const;

export default getRequestConfig(async ({locale}) => {
  const l: Locale = (locales as readonly string[]).includes(locale ?? '') ? (locale as Locale) : defaultLocale;

  // ★ ここで実際にどっちを読んだかと代表キーの値を出す
  const lp = await loaders.lp[l]();
  console.log('[i18n] resolved locale =', l);
  console.log('[i18n] lp.hero.title =', lp?.hero?.title);

  const messages = { lp };
  return { locale: l, messages };
});
