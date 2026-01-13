'use client';

import Link from 'next/link';
import HeaderAuthButtons from '@/components/button/HeaderAuthButtons';
import { flags } from '@/lib/flags'; // ← タイポ修正

type HeaderProps = {
  variant?: 'dark' | 'light';
  transparent?: boolean;
};

export default function Header({ variant = 'dark', transparent = true }: HeaderProps) {

  const isDark = variant === 'dark';
  const base =
    'fixed inset-x-0 top-0 z-50 border-b backdrop-blur h-14 flex items-center';
  const tone = isDark
    ? `${transparent ? 'bg-black/60' : 'bg-black'} border-white/10`
    : `${transparent ? 'bg-white/70' : 'bg-white'} border-zinc-200`;

  const txt = isDark ? 'text-white' : 'text-zinc-900';

  const navLinkCls = isDark
    ? 'text-white/80 hover:text-white text-sm'
    : 'text-zinc-700 hover:text-zinc-900 text-sm';

  const ruinBtnCls = isDark
    ? 'text-sm rounded-lg px-2.5 py-1 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10 transition'
    : 'text-sm rounded-lg px-2.5 py-1 border border-emerald-600/40 text-emerald-700 hover:bg-emerald-600/10 transition';

  return (
    <header className={`${base} ${tone}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 sm:px-6 lg:px-12">
        {/* 左：ロゴ */}
        <Link href="/" className={`text-2xl font-bold ${txt}`} aria-label="Delver Home">
          Delver
        </Link>

        {/* 中央ナビ */}
        <nav className="ml-6 hidden gap-6 md:flex">
          <Link href="/blog" className={navLinkCls}>
            Blog
          </Link>

          {/* FREEモード中はPricingを非表示 */}
          {!flags.freeMode && (
            <Link href="/#pricing" className={navLinkCls}>
              Pricing
            </Link>
          )}

          <Link href="/app" aria-label="Trading Simulator" className={ruinBtnCls}>
            Trading Simulator
          </Link>

          {/* 破産確率シミュレーター */}
          <Link href="/tools/risk-of-ruin" aria-label="Risk of Ruin Simulator" className={ruinBtnCls}>
            Ruin Simulator
          </Link>
        </nav>

        {/* 右寄せ */}
        <div className="flex-1" />

        {/* 右：Auth */}
        <HeaderAuthButtons variant={variant} />
      </div>
    </header>
  );
}
