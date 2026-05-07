'use client';

import { Link } from '@/i18n/routing'; // 👈 ここ重要！
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react'; // アイコン追加
import HeaderAuthButtons from '@/components/button/HeaderAuthButtons';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'; // 既存のUIコンポーネント
import LanguageSwitcher from "./LanguageSwitcher";


type HeaderProps = {
  variant?: 'dark' | 'light';
  transparent?: boolean;
};

export default function Header({ variant = 'dark', transparent = true }: HeaderProps) {
const t = useTranslations('Header'); // 👈 JSONの"Header"セクションを使用
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

const backtestBtnCls = isDark
  ? `
    group relative inline-flex items-center
    text-sm font-medium
    rounded-lg px-3 py-1.5
    text-white
    border border-red-500/40
    bg-gradient-to-r from-black via-zinc-900 to-black
    transition-colors duration-200
    hover:border-red-500/60
    overflow-hidden
  `

: `
    group relative inline-flex items-center
    text-sm font-medium
    rounded-lg px-3 py-1.5
    text-zinc-900
    border border-red-600/40
    bg-gradient-to-r from-white via-zinc-100 to-white
    /* shadow-[...] を削除 */
    /* hover:shadow-[...] を削除 */
    hover:border-red-600/60
    hover:-translate-y-[1px]
    active:translate-y-0
    overflow-hidden
  `;
  const blogLinkCls = isDark
  ? `
    relative text-sm text-white/80
    after:absolute after:left-0 after:-bottom-0.5
    after:h-[1px] after:w-full
    after:bg-white/30 after:scale-x-0 after:origin-left
    after:transition-transform after:duration-300
    hover:text-white
    hover:after:scale-x-100
  `
  : `
    relative text-sm text-zinc-700
    after:absolute after:left-0 after:-bottom-0.5
    after:h-[1px] after:w-full
    after:bg-zinc-400 after:scale-x-0 after:origin-left
    after:transition-transform after:duration-300
    hover:text-zinc-900
    hover:after:scale-x-100
  `;

const MobileLink = ({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link href={href} className={`text-lg font-medium py-4 border-b border-slate-200 ${className}`}>
      {children}
    </Link>
  );

return (
    <header className={`${base} ${tone}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 sm:px-6 lg:px-12">
        {/* 左：ロゴ */}
        <Link href="/" className={`text-2xl font-bold ${txt}`} aria-label="Delver Home">
          Delver
        </Link>

        {/* 中央ナビ */}
        <nav className="ml-6 hidden items-center gap-4 md:flex">
          <Link href="/blog" className={blogLinkCls}>
            {t('blog')}
          </Link>
          <Link href="/community" className={blogLinkCls}>
            {t('community')}
          </Link>


          <Link href="/#try" aria-label="Trading Simulator" className={backtestBtnCls}>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(220,38,38,0.18),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative tracking-wide">
              {t('backtest')}
            </span>
          </Link>

          <Link href="/tools/risk-of-ruin" className={ruinBtnCls}>
            {t('ruin')}
          </Link>

          <Link href="/tools/expected-value" className={ruinBtnCls}>
            {t('expectedValue')}
          </Link>
          <Link href="/chart" className={ruinBtnCls}>
            {t('chart')}
          </Link>
          <LanguageSwitcher/>
        </nav>

        <div className="flex-1" />

        {/* 右：Auth & Hamburger */}
        <div className="flex items-center gap-3">
          <HeaderAuthButtons variant={variant} />

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className={`p-2 ${txt}`} aria-label="Open Menu">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white border-l border-slate-200 p-6 flex flex-col text-slate-900">
                <SheetTitle className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">
                  {t('menu')}
                </SheetTitle>

                <nav className="flex flex-col">
                  <MobileLink href="/blog" className="text-slate-700 border-slate-200">{t('blog')}</MobileLink>
                  <MobileLink href="/community" className="text-slate-700 border-slate-200">{t('community')}</MobileLink>
                  <MobileLink href="/#try" className="text-indigo-600 border-slate-200 font-medium">{t('backtest')}</MobileLink>
                  <MobileLink href="/tools/risk-of-ruin" className="text-slate-700 border-slate-200">{t('ruin')}</MobileLink>
                  <MobileLink href="/tools/expected-value" className="text-slate-700 border-slate-200">{t('expectedValue')}</MobileLink>
                  <MobileLink href="/chart" className="text-slate-700 border-slate-200">{t('chart')}</MobileLink>
                </nav>

                <div className="mt-auto text-xs text-slate-400 text-center uppercase tracking-widest">
                  Delver - Advanced Backtest Engine
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}