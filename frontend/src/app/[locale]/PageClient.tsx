// app/[locale]/PageClient.tsx  ← Client Component
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Newsletter from '../(public)/components/Newsletter';
import Header from '@/components/layout/Header';
import Image from "next/image";
import BetaSignupCard from '@/components/BetaSignupCard';
import Explanation from '@/components/explanation';

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
      {children}
    </div>
  );
}

export default function PageClient({ locale }: { locale: string }) {
  const t = useTranslations('LP');

  return (
    <main className="relative isolate pt-14">
      <Header variant="light" transparent />

      {/* ===== Hero ===== */}
      <section className="relative border-b border-slate-200/60 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-16 md:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <span>Beta</span>
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <span>FX · Crypto Backtest</span>
            </div>

            <h1 className="text-[clamp(24px,5vw,48px)] font-bold tracking-tight text-slate-900 leading-tight">
              {t('Hero.title')}
            </h1>

            <p className="mx-auto max-w-3xl text-slate-600 text-base sm:text-lg leading-relaxed">
              {t('Hero.subtitle')}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 active:scale-[.98] w-full sm:w-auto"
              >
                {t('Hero.cta')}
              </a>
            </div>

            <p className="text-sm text-slate-500">
              {t('Hero.disclaimer')}
            </p>
          </div>

          {/* スクリーンショット + サンプル成績バー */}
          <div className="mx-auto mt-12 md:mt-16 w-full max-w-5xl">
            <div className="overflow-hidden rounded-t-xl border border-b-0 border-slate-200/80 bg-white shadow-sm">
              <Image
                src="/lp/results_overview.png"
                width={1600}
                height={900}
                className="w-full h-auto"
                alt="パフォーマンスダッシュボードのプレビュー"
              />
            </div>
            {/* 成績サンプルバー */}
            <div className="grid grid-cols-3 rounded-b-xl overflow-hidden border border-t-0 border-slate-200/80">
              <div className="bg-slate-900 py-3 text-center">
                <div className="text-emerald-400 font-bold text-xl tabular-nums">51.2%</div>
                <div className="text-slate-400 text-xs mt-0.5">勝率</div>
              </div>
              <div className="bg-slate-900 py-3 text-center border-x border-slate-700/50">
                <div className="text-emerald-400 font-bold text-xl tabular-nums">1.02</div>
                <div className="text-slate-400 text-xs mt-0.5">PF</div>
              </div>
              <div className="bg-slate-900 py-3 text-center">
                <div className="text-red-400 font-bold text-xl tabular-nums">-36.0%</div>
                <div className="text-slate-400 text-xs mt-0.5">最大DD</div>
              </div>
            </div>
            <p className="mt-1.5 text-center text-xs text-slate-400">
              ※ {t('TrySection.sampleBadge')}
            </p>
          </div>
        </div>
      </section>

      {/* ===== 早期登録CTA ===== */}
      <section
        id="signup"
        className="py-16 md:py-24 border-b border-slate-200/60 bg-slate-50/50"
      >
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            早期登録キャンペーン中
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            早期アクセスに登録する
          </h2>
          <p className="text-slate-600">
            リリース時に真っ先にお知らせします。登録は無料です。
          </p>
          <BetaSignupCard />
        </div>
      </section>


{/* ===== SEO copy ===== */}
      <section className="py-10 md:py-14 border-b border-slate-200/60 bg-white" aria-label="About Delver">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-12">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight mb-4">
            {t('SeoCopy.heading')}
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {t.rich('SeoCopy.body', { strong: (c) => <strong>{c}</strong> })}
          </p>
        </div>
      </section>

      {/* ===== エントリー条件 ===== */}
      <section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12 bg-slate-50/50">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight text-slate-900 text-[clamp(22px,4vw,36px)] tracking-tight">
              {t('SectionHeadings.entry')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-[clamp(14px,1.6vw,17px)]">
              {t('Sections.entry')}
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex justify-center">
            <div className="w-full max-w-[min(720px,90vw)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <Image src="/lp/entry_condition.png" width={1600} height={900} className="w-full h-auto" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 時間帯フィルター ===== */}
      <section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12 border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
          <div className="order-1 md:order-1 space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight text-slate-900 text-[clamp(22px,4vw,36px)] tracking-tight">
              {t('SectionHeadings.timezone')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-[clamp(14px,1.6vw,17px)]">
              {t('Sections.timezone')}
            </p>
          </div>
          <div className="order-2 md:order-2 flex justify-center">
            <div className="w-full max-w-[min(720px,90vw)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <Image src="/lp/timezone.png" width={1600} height={900} className="w-full h-auto" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== テクニカル指標 ===== */}
      <section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12 bg-slate-50/50">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight text-slate-900 text-[clamp(22px,4vw,36px)] tracking-tight">
              {t('SectionHeadings.indicator')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-[clamp(14px,1.6vw,17px)]">
              {t('Sections.indicator')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[min(720px,90vw)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <Image src="/lp/indicator.png" width={1600} height={900} className="w-full h-auto" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 価格パターン ===== */}
      <section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12 border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight text-slate-900 text-[clamp(22px,4vw,36px)] tracking-tight">
              {t('SectionHeadings.priceAction')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-[clamp(14px,1.6vw,17px)]">
              {t('Sections.priceAction')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[min(720px,90vw)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <Image src="/lp/priceAction.png" width={1600} height={900} className="w-full h-auto" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== チャートパターン ===== */}
      <section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12 bg-slate-50/50">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight text-slate-900 text-[clamp(22px,4vw,36px)] tracking-tight">
              {t('SectionHeadings.chartPattern')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-[clamp(14px,1.6vw,17px)]">
              {t('Sections.chartPattern')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[min(720px,90vw)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <Image src="/lp/chartpattern.png" width={1600} height={900} className="w-full h-auto" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 決済ルール ===== */}
      <section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12 border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight text-slate-900 text-[clamp(22px,4vw,36px)] tracking-tight">
              {t('SectionHeadings.exit')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-[clamp(14px,1.6vw,17px)]">
              {t('Sections.exit')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[min(720px,90vw)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <Image src="/lp/exit.png" width={1600} height={900} className="w-full h-auto" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== なぜ Delver？ ===== */}
      <section id="features" className="section border-t border-slate-200/60 bg-slate-50/50">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="h2">{t('Features.title')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="card">
              <div className="text-sm font-medium text-slate-500">{t('Features.speed.label')}</div>
              <p className="mt-2 text-slate-600 leading-relaxed">{t('Features.speed.desc')}</p>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-slate-500">{t('Features.parallel.label')}</div>
              <p className="mt-2 text-slate-600 leading-relaxed">{t('Features.parallel.desc')}</p>
            </div>
            <div className="card ring-1 ring-indigo-500/20">
              <div className="text-sm font-medium text-slate-500">{t('Features.free.label')}</div>
              <p className="mt-2 text-slate-600 leading-relaxed">{t('Features.free.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 使い方（Explanation） ===== */}
      <Explanation />

      {/* ===== 使い方（How it works チェックリスト） ===== */}
      <section className="section border-t border-slate-200/60 bg-white">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="h2">{t('HowItWorks.title')}</h2>
          <div className="mt-8 space-y-4">
            <Check>
              <p className="text-slate-600 leading-relaxed">{t('HowItWorks.step1')}</p>
            </Check>
            <Check>
              <p className="text-slate-600 leading-relaxed">{t('HowItWorks.step2')}</p>
            </Check>
            <Check>
              <p className="text-slate-600 leading-relaxed">{t('HowItWorks.step3')}</p>
            </Check>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="section pt-10 border-t border-slate-200/60 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="font-semibold text-slate-900">{t('Footer.copy')}</div>
              <p className="mt-2 text-sm text-slate-600">{t('Footer.desc')}</p>
            </div>
            <nav className="space-y-2 text-sm text-slate-600">
              <Link href="/blog" className="block hover:text-slate-900">Blog</Link>
              <Link href="/contact" className="block hover:text-slate-900">{t('Footer.contact')}</Link>
              <Link href="/terms" className="block hover:text-slate-900">{t('Footer.terms')}</Link>
            </nav>
            <div>
              <div className="text-sm text-slate-600">{t('Footer.newsletter')}</div>
              <Newsletter />
            </div>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} {t('Footer.copy')}
          </div>
        </div>
      </footer>
    </main>
  );
}
