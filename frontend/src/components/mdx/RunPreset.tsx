'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

type Props = { children?: React.ReactNode };

export default function RunPreset({ children }: Props) {
  const locale = useLocale();

  const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN ?? '';
  const to = `${ORIGIN}/${locale}/app`;

  // locale に応じたデフォルト文言
  const defaultLabel =
    locale === 'en'
      ? 'Run this article’s conditions'
      : 'この記事の条件で検証する';

  return (
    <Link
      href={to}
      className="not-prose inline-flex items-center justify-center gap-2 rounded-md
                 px-3.5 py-2.5 text-sm font-medium
                 bg-blue-600 text-white !text-white hover:bg-blue-700 active:bg-blue-800
                 transition-colors"
    >
      {children ?? defaultLabel}
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
        className="opacity-80"
      >
        <path d="M12.293 3.293a1 1 0 011.414 0l4 4a.997.997 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 9H4a1 1 0 110-2h10.586l-2.293-2.293a1 1 0 010-1.414z"/>
      </svg>
    </Link>
  );
}
