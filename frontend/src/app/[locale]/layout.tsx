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

  return {
    title: {
      default: 'Delver',
      template: '%s | Delver',
    },
    description:
      locale === 'en'
        ? 'A tool to numerically verify FX bankruptcy probability and compound interest.'
        : 'FXの破産確率・複利を数値で検証するツール',
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}${pathname}`,
      languages: {
        ja: `${BASE}/ja${pathWithoutLocale}`,
        en: `${BASE}/en${pathWithoutLocale}`,
        'x-default': `${BASE}/ja${pathWithoutLocale}`,
      },
    },
    openGraph: {
      title: 'Delver',
      description: 'FXの破産確率・複利を数値で検証するツール',
      url: `${BASE}${pathname}`,
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
      <LocaleLangSync />
      {children}
    </NextIntlClientProvider>
  );
}
