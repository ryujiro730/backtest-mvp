'use client';

import {useTranslations} from 'next-intl';
import Link from 'next/link';
import CTA from '../(public)/components/CTA';

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
  const t = useTranslations();

  return (
    <main className="relative isolate">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 hero-gradient" />
        <div className="container mx-auto max-w-6xl px-6 py-24 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <span>{t('hero.badgeLeft')}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>{t('hero.badgeRight')}</span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                {t('hero.title')}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300">
              {t('hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#pricing" className="btn w-full justify-center sm:w-auto">
                {t('cta.primary')}
              </a>
              <Link href="/features" className="btn-ghost w-full justify-center sm:w-auto">
                {t('cta.secondary')}
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/60">{t('social.proof')}</p>
          </div>

          {/* mock screenshot */}
          <div className="mx-auto mt-12 max-w-5xl">
            <div className="card relative overflow-hidden">
              <div aria-hidden className="absolute -inset-20 glow" />
              <div className="aspect-[16/9] w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="section">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="h2">{t('features.title')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
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
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="h2">{t('how.title')}</h2>
          <div className="mt-6 space-y-6">
            <Check>
              <p>{t('how.step1.before')} <Kbd>F</Kbd> {t('how.step1.after')}</p>
            </Check>
            <Check>
              <p>{t('how.step2.before')} <Kbd>⌘↵</Kbd> {t('how.step2.after')}</p>
            </Check>
            <Check>
              <p>{t('how.step3')}</p>
            </Check>
          </div>
        </div>
      </section>

      {/* ===== Pricing teaser ===== */}
      <section id="pricing" className="section">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="h2">{t('pricing.title')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
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
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="font-bold">{t('site.brand')}</div>
              <p className="mt-2 text-sm text-zinc-400">{t('footer.tagline')}</p>
            </div>
            <nav className="space-y-2 text-sm text-zinc-400">
              <Link href="/features" className="block hover:text-zinc-200">{t('footer.nav.features')}</Link>
              <Link href="/pricing" className="block hover:text-zinc-200">{t('footer.nav.pricing')}</Link>
              <Link href="/terms" className="block hover:text-zinc-200">{t('footer.nav.terms')}</Link>
            </nav>
            <div>
              <div className="text-sm text-zinc-400">{t('footer.newsletter')}</div>
              <CTA />
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
