'use client';
import {useLocale, useTranslations,} from 'next-intl';
import { CDN } from '@/config/env';
import Link from 'next/link';
import Newsletter from '../(public)/components/Newsletter';
import Image from "next/image";

function Kbd({children}:{children:React.ReactNode}) {
  return <span className="kbd">{children}</span>;
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
      {children}
    </div>
  );
}

export default function Page() {
  const locale = useLocale();
  const t = useTranslations('lp');

  return (
    <main className="relative isolate">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 hero-gradient -z-10" />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20 lg:py-24 relative z-10 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <span>{t('hero.badgeLeft')}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>{t('hero.badgeRight')}</span>
            </div>

            <h1 className="mt-6 font-black tracking-tight text-white
                           text-[clamp(28px,6vw,64px)] leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text tracking-normal text-transparent">
                {t('hero.title')}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-zinc-300
                          text-base sm:text-lg md:text-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="app" className="btn w-full justify-center sm:w-auto">
                {t('cta.primary')}
              </a>
            </div>

            <p className="mt-6 text-sm text-white/60">{t('social.proof')}</p>
          </div>

          {/* mock screenshot */}
          <div className="mx-auto mt-10 md:mt-12 w-full max-w-5xl">
            <div className="card relative overflow-hidden">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpHeroPhoto.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section: Define entry Conditions ===== */}
      <section className="mt-6 w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold leading-tight break-words
                           text-[clamp(24px,5vw,48px)]">
              {t('Define.title')}
            </h3>
            <p className="text-zinc-300 leading-snug
                          text-[clamp(14px,1.6vw,20px)]">
              {t('Define.subtitle')}
            </p>
          </div>

          <div className="mt-8 md:mt-0 flex justify-center">
            <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpSettingsPhoto.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section: TimeZone ===== */}
      <section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
          <div className="order-1 md:order-1 space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight
                           text-[clamp(24px,5vw,48px)]">
              {t('TimeZone.title')}
            </h3>
            <p className="text-zinc-300 leading-snug
                          text-[clamp(14px,1.6vw,20px)]">
              {t('TimeZone.subtitle')}
            </p>
          </div>

          <div className="order-2 md:order-2 flex justify-center">
            <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpSettingsPhoto2.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section: Indicator ===== */}
      <section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight
                           text-[clamp(24px,5vw,48px)]">
              {t('Indicator.title')}
            </h3>
            <p className="text-zinc-300 leading-snug
                          text-[clamp(14px,1.6vw,20px)]">
              {t('Indicator.subtitle')}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpSettingsPhoto4.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section: PriceAction ===== */}
      <section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight
                           text-[clamp(24px,5vw,48px)]">
              {t('PriceAction.title')}
            </h3>
            <p className="text-zinc-300 leading-snug
                          text-[clamp(14px,1.6vw,20px)]">
              {t('PriceAction.subtitle')}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpSettingsPhoto5.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section: ChartPattern ===== */}
      <section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight
                           text-[clamp(24px,5vw,48px)]">
              {t('ChartPattern.title')}
            </h3>
            <p className="text-zinc-300 leading-snug
                          text-[clamp(14px,1.6vw,20px)]">
              {t('ChartPattern.subtitle')}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpSettingsPhoto6.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section: Exit ===== */}
      <section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
          <div className="space-y-4 md:space-y-6">
            <h3 className="font-semibold leading-tight
                           text-[clamp(24px,5vw,48px)]">
              {t('Exit.title')}
            </h3>
            <p className="text-zinc-300 leading-snug
                          text-[clamp(14px,1.6vw,20px)]">
              {t('Exit.subtitle')}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
              <Image
                src={`${CDN}/public-uploads/LpSettingsPhoto3.png`}
                width={1600}
                height={900}
                className="w-full h-auto rounded-xl border border-white/10"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="section">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="h2">{t('features.title')}</h2>
          <div className="mt-8 grid gap-[clamp(12px,2vw,24px)] sm:grid-cols-2 md:grid-cols-3">
            <div className="card">
              <div className="text-sm text-zinc-400">{t('features.speed.title')}</div>
              <p className="mt-2 text-zinc-300">{t('features.speed.desc')}</p>
            </div>
            <div className="card">
              <div className="text-sm text-zinc-400">{t('features.parallel.title')}</div>
              <p className="mt-2 text-zinc-300">{t('features.parallel.desc')}</p>
            </div>
            <div className="card ring-1 ring-brand-500/30">
              <div className="text-sm text-zinc-400">{t('features.paywall.title')}</div>
              <p className="mt-2 text-zinc-300">{t('features.paywall.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="section">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="h2">{t('how.title')}</h2>
          <div className="mt-6 space-y-[clamp(8px,1.5vw,16px)]">
            <Check>
              <p>{t('how.step1.before')} {t('how.step1.after')}</p>
            </Check>
            <Check>
              <p>{t('how.step2.before')} <Kbd>Run</Kbd> {t('how.step2.after')}</p>
            </Check>
            <Check>
              <p>{t('how.step3')}</p>
            </Check>
          </div>
        </div>
      </section>

      {/* ===== Pricing teaser ===== */}
      <section id="pricing" className="section">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="h2">{t('pricing.title')}</h2>
          <div className="mt-8 grid gap-[clamp(12px,2vw,24px)] sm:grid-cols-2 md:grid-cols-3">
            <div className="card">
              <div className="text-sm text-zinc-400">{t('pricing.free.name')}</div>
              <div className="mt-2 text-3xl font-extrabold">{t('pricing.free.price')}</div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li>{t('pricing.free.feature1')}</li>
                <li>{t('pricing.free.feature2')}</li>
                <li>{t('pricing.free.feature3')}</li>
              </ul>
            </div>
            <div className="card ring-1 ring-brand-500/40">
              <div className="text-sm text-zinc-400">{t('pricing.pro.name')}</div>
              <div className="mt-2 text-3xl font-extrabold">{t('pricing.pro.price')}</div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li>{t('pricing.pro.feature1')}</li>
                <li>{t('pricing.pro.feature2')}</li>
                <li>{t('pricing.pro.feature3')}</li>
              </ul>
              <a href="#" className="btn mt-6 w-full justify-center">{t('pricing.pro.cta')}</a>
            </div>
            <div className="card">
              <div className="text-sm text-zinc-400">{t('pricing.elite.name')}</div>
              <div className="mt-2 text-3xl font-extrabold">{t('pricing.elite.price')}</div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li>{t('pricing.elite.feature1')}</li>
                <li>{t('pricing.elite.feature2')}</li>
                <li>{t('pricing.elite.feature3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="section pt-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-[clamp(12px,2vw,20px)] md:grid-cols-3">
            <div>
              <div className="font-bold">{t('site.brand')}</div>
              <p className="mt-2 text-sm text-zinc-400">{t('footer.tagline')}</p>
            </div>
            <nav className="space-y-2 text-sm text-zinc-400">
              <Link href="/blog" className="block hover:text-zinc-200">{t('footer.nav.features')}</Link>
              <Link href="/contact" className="block hover:text-zinc-200">{t('footer.nav.pricing')}</Link>
              <Link href="/terms" className="block hover:text-zinc-200">{t('footer.nav.terms')}</Link>
            </nav>
            <div>
              <div className="text-sm text-zinc-400">{t('footer.newsletter')}</div>
              <Newsletter />
            </div>
          </div>
          <div className="mt-10 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
            © {new Date().getFullYear()} {t('site.brand')}
          </div>
        </div>
      </footer>
    </main>
  );
}
