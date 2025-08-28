// src/app/layout.tsx
import type { ReactNode } from 'react';
import './globals.css';
import {getLocale} from 'next-intl/server';

export const metadata = {
  title: 'Delver',
  description: 'Ultra-low latency backtests with parallel execution.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // ★ ミドルウェアで決まった現在ロケールを取得
  const locale = await getLocale(); // 'ja' | 'en'

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-screen bg-[#0b0b10] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
