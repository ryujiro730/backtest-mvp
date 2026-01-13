// src/app/layout.tsx

import type { ReactNode } from 'react';
import './globals.css';
import Script from 'next/script';
import GA from './ga';

export async function generateMetadata() {
  return {
    title: {
      default: 'Delver',
      template: '%s | Delver',
    },
    description: 'FXの破産確率・複利を数値で検証するツール',
    metadataBase: new URL('https://delvertrade.com'),
    openGraph: {
      title: 'Delver',
      description: 'FXの破産確率・複利を数値で検証するツール',
      url: 'https://delvertrade.com',
      siteName: 'Delver',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-Z3MGBV03EV';

  return (
    <html lang="ja" className="h-full">
      <head>
        {/* GA4 */}
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
      <body className="min-h-screen bg-[#0b0b10] text-white antialiased">
        <GA gaId={GA_ID} />
        {children}
      </body>
    </html>
  );
}
