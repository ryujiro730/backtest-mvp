// app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LocaleLangSync } from '@/components/LocaleLangSync';

const BASE = 'https://delvertrade.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pathname = (await headers()).get('x-pathname') || `/${locale}`;
  const pathWithoutLocale = pathname.replace(/^\/(ja|en)/, '') || '/';
  const isRootPage = pathWithoutLocale === '/';
  const canonicalUrl = isRootPage ? `${BASE}/` : `${BASE}${pathname}`;

  return {
    title: {
      default: 'Delver',
      template: '%s | Delver',
    },
    description:
      locale === 'en'
        ? 'Free browser-based forex backtester. Test trading strategies with 20+ years of data, then verify entries on a chart — no install required.'
        : 'FX取引戦略を数値で検証できる無料ブラウザバックテスター。20年以上のデータで戦略をテストし、チャートでエントリーポイントを目視確認。インストール不要。',
    metadataBase: new URL(BASE),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: `${BASE}/ja${pathWithoutLocale}`,
        en: `${BASE}/en${pathWithoutLocale}`,
        'x-default': `${BASE}/ja${pathWithoutLocale}`,
      },
    },
    openGraph: {
      title: locale === 'en' ? 'Delver – Free Forex Backtester' : 'Delver – 無料FXバックテスター',
      description:
        locale === 'en'
          ? 'Free browser-based forex backtester. Test trading strategies with 20+ years of data, then verify entries on a chart — no install required.'
          : 'FX取引戦略を数値で検証できる無料ブラウザバックテスター。インストール不要。',
      url: `${BASE}${pathname}`,
      siteName: 'Delver',
      locale: locale === 'en' ? 'en_US' : 'ja_JP',
      type: 'website',
      images: [
        {
          url: `${BASE}/blog/bollinger-bands-10000-backtest-results/delver_results_en.png`,
          width: 1200,
          height: 630,
          alt: 'Delver – Forex Backtest Results',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${BASE}/blog/bollinger-bands-10000-backtest-results/delver_results_en.png`],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleLangSync />
      {children}
    </NextIntlClientProvider>
  );
}
