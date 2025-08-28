import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {locales} from '@/i18n';

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function LocaleLayout(
  props: {
    children: ReactNode;
    params: Promise<{ locale: 'ja' | 'en' }>;
  }
) {
  const { children, params } = props;

  // ★ 引数で分割しない。ここで await
  const { locale } = await params;

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
