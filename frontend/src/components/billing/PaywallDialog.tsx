'use client';

import { useMemo, useState } from 'react';
import LoginInline from '@/components/auth/LoginInline';
import { useTranslations } from 'next-intl';

type BillingPeriod = 'monthly' | 'yearly';

type PlanId = 'free' | 'starter' | 'pro';

export default function PaywallDialog({
  open,
  onOpenChange,
  used,
  limit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  used?: number;
  limit?: number;
}) {
  const t = useTranslations('paywall');
  const [showLogin, setShowLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  async function startCheckout() {
    setBusy(true);
    try {
      const me = await fetch('/api/auth/me').then((r) => r.json());
      if (!me.user) { setShowLogin(true); return; }
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (res.status === 401) { setShowLogin(true); return; }
      const { url, error } = await res.json();
      if (error || !url) throw new Error(error || 'failed');
      window.location.href = url;
    } catch (e: any) {
      alert(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4">
      <div
        className="
          isolate relative w-[min(100vw-2rem,1100px)]
          overflow-hidden rounded-2xl border border-white/10
          bg-white text-zinc-900 dark:bg-white dark:text-zinc-900
          shadow-2xl backdrop-blur [color-scheme:light]
        "
      >
        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label={t('close')}
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-8 sm:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {t('title')}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">{t('subtitle')}</p>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <a
                href="/contact"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
              >
                {t('contact')}
              </a>

              <div className="ml-2 inline-flex rounded-full border border-zinc-200 bg-white p-1 text-xs">
                <button
                  className={`rounded-full px-3 py-1 ${
                    period === 'yearly'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  onClick={() => setPeriod('yearly')}
                >
                  {t('yearly')}{' '}
                  {period === 'yearly' && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      {t('yearlyBadge')}
                    </span>
                  )}
                </button>
                <button
                  className={`rounded-full px-3 py-1 ${
                    period === 'monthly'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                  onClick={() => setPeriod('monthly')}
                >
                  {t('monthly')}
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              {t('freeUsage', { used: used ?? 0, limit: limit ?? 3 })}
            </p>
          </div>
        </div>

        {/* Pricing grid */}
        <div className="px-6 py-8 sm:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <PlanCard
                key={p.id}
                id={p.id}
                gradient={p.gradient}
                price={period === 'monthly' ? p.priceMonthly : p.priceYearly}
                period={period}
                onClick={p.id === 'free' ? undefined : startCheckout}
                busy={busy}
                highlighted={p.id !== 'free' && p.id !== 'starter'}
              />
            ))}
          </div>

          {/* Login inline */}
          {showLogin && (
            <div className="mx-auto mt-8 max-w-md rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold">{t('signin')}</h3>
              <LoginInline onSuccess={startCheckout} />
            </div>
          )}

          <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
            <span>
              {t('footerLeft')}{' '}
              <a
                className="underline decoration-zinc-400 hover:text-zinc-800"
                href="mailto:info@delvertrade.com"
              >
                info@delvertrade.com
              </a>
              .
            </span>
            <span className="hidden sm:block">{t('footerRight')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  id,
  gradient,
  price,
  period,
  onClick,
  highlighted,
  busy,
}: {
  id: PlanId;
  gradient: string;
  price: number;
  period: BillingPeriod;
  onClick?: () => void;
  highlighted?: boolean;
  busy?: boolean;
}) {
  const tp = useTranslations(`paywall.plans.${id}`);
  const t = useTranslations('paywall');

  const priceLabel = useMemo(
    () => (price === 0 ? '$0' : `$${price}`),
    [price]
  );

  const features = tp.raw('features') as string[];

  return (
    <div
      className={`relative rounded-2xl border p-[1px] ${
        highlighted ? 'border-transparent' : 'border-zinc-200'
      }`}
      style={
        highlighted
          ? {
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(0,0,0,0) 20%), ' +
                gradient,
            }
          : undefined
      }
    >
      <div className="flex h-full flex-col justify-between rounded-[14px] bg-white/95 p-5 ring-1 ring-white/10 backdrop-blur">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{tp('name')}</h3>
            {id === 'free' && (
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
                {tp('active')}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <div className="text-3xl font-bold">{priceLabel}</div>
            <div className="text-sm text-zinc-500">
              / {period === 'monthly' ? 'month' : 'year'}
            </div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-none" viewBox="0 0 24 24">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          disabled={!onClick || busy}
          onClick={onClick}
          className={`mt-5 w-full rounded-xl px-4 py-2 text-sm font-medium shadow transition ${
            onClick
              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
              : 'cursor-default bg-zinc-100 text-zinc-500'
          }`}
        >
          {busy && onClick ? t('cta.processing') : onClick ? t('cta.upgrade') : t('cta.current')}
        </button>
      </div>
    </div>
  );
}

/** 設定：価格や見た目だけ。文言は翻訳から取得 */
const PLANS: Array<{
  id: PlanId;
  priceMonthly: number;
  priceYearly: number;
  gradient: string;
}> = [
  {
    id: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    gradient:
      'radial-gradient(80% 120% at 100% 0%, #0a0a0a 0%, #0a0a0a 40%, #111827 100%)',
  },
  {
    id: 'starter',
    // ← 価格は仮。Stripe側のローカル通貨に合わせて表示は別で調整可
    priceMonthly: 20,
    priceYearly: 192,
    gradient:
      'radial-gradient(120% 150% at 0% 0%, #2563eb 0%, #06b6d4 45%, #2563eb80 100%)',
  },
  {
    id: 'pro',
    priceMonthly: 35,
    priceYearly: 336,
    gradient:
      'radial-gradient(120% 150% at 0% 0%, #9333ea 0%, #ec4899 45%, #9333ea80 100%)',
  },
];
