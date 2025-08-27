'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

type Locale = 'en' | 'ja';

function swapLocaleInPath(path: string, to: Locale) {
  // 先頭の /en or /ja を置換。なければ付与（念のため）
  if (/^\/(en|ja)(\/|$)/.test(path)) {
    return path.replace(/^\/(en|ja)/, `/${to}`);
  }
  return `/${to}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default function LangSwitcher() {
  const pathname = usePathname() || '/';
  const current = useLocale() as Locale;

  const setCookie = (locale: Locale) => {
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const toJA = swapLocaleInPath(pathname, 'ja');
  const toEN = swapLocaleInPath(pathname, 'en');

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={toJA}
        onClick={() => setCookie('ja')}
        className={current === 'ja' ? 'font-semibold underline' : 'opacity-70 hover:opacity-100'}
        aria-current={current === 'ja' ? 'page' : undefined}
      >
        日本語
      </Link>
      <span>/</span>
      <Link
        href={toEN}
        onClick={() => setCookie('en')}
        className={current === 'en' ? 'font-semibold underline' : 'opacity-70 hover:opacity-100'}
        aria-current={current === 'en' ? 'page' : undefined}
      >
        English
      </Link>
    </div>
  );
}
