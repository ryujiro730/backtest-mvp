// app/layout.tsx
import type { ReactNode } from 'react';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';
import "katex/dist/katex.min.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-Z3MGBV03EV';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className={`h-full ${inter.variable}`} suppressHydrationWarning lang="ja">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
