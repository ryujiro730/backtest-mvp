// app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    title: {
      default: 'Delver',
      template: '%s | Delver',
    },
    description: locale === 'en' 
      ? 'A tool to numerically verify FX bankruptcy probability and compound interest.' 
      : 'FXの破産確率・複利を数値で検証するツール',
    metadataBase: new URL('https://delvertrade.com'),
    
    // --- 【重要】多言語SEO設定を追加 ---
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ja: '/ja',
        en: '/en',
        'x-default': '/ja', // 言語設定がないユーザー向けのデフォルトページ
      },
    },
    // ----------------------------------

    openGraph: {
      title: 'Delver',
      description: 'FXの破産確率・複利を数値で検証するツール',
      url: `https://delvertrade.com/${locale}`,
      siteName: 'Delver',
      locale: locale === 'en' ? 'en_US' : 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
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
      {children}
    </NextIntlClientProvider>
  );
}
