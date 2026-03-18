'use client';

import { useRouter } from '@/i18n/routing';
import { useMemo, useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import LoginInline from '@/components/auth/LoginInline';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type BillingPeriod = 'monthly' | 'yearly';
type PlanId = 'free' | 'starter' | 'pro';

/* ===== 日本語文言（旧 i18n の中身） ===== */

const TEXT = {
  title: 'サブスクリプションを購入',
  close: '閉じる',
  subtitle: '高速バックテストと無制限実行をアンロック。',
  signin: '続行するにはログインしてください',
  contact: 'エンタープライズ・チームプラン受付中 ↗',
  yearly: '年払い',
  monthly: '月払い',
  yearlyBadge: '–20% 年払い',
  footerLeft: 'サブスクに関するお問い合わせ:',
  footerRight: '決済は Stripe により安全に処理されます',
  cta: {
    current: '現在のプラン',
    upgrade: 'アップグレード',
    processing: '処理中…',
  },
};

const PLAN_NAMES: Record<PlanId, string> = {
  free: '無料プラン',
  starter: 'スターター',
  pro: 'プロ',
};

const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: ['月あたりの実行回数に制限あり', '基本機能のみ'],
  starter: ['1日あたり30回まで実行可能', '優先サポート'],
  pro: ['実行回数 無制限', '高度な指標', '優先サポート'],
};

/* ===== プラン定義（価格・見た目） ===== */

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

/* ===== Component ===== */

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
  const router = useRouter();
  const locale = useLocale();

  const [showLogin, setShowLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  const go = async (plan: PlanId) => {
    const nextCheckout = `/billing/checkout?plan=${plan}&period=${period}`;

    if (!authed) {
      router.push(`/${locale}/login?next=${encodeURIComponent(nextCheckout)}` as any);
      return;
    }

    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan: plan === 'free' ? 'starter' : plan,
          period,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: any) {
      alert(e.message ?? 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4">
      <div className="relative w-[min(100vw-2rem,1100px)] rounded-2xl bg-white text-zinc-900 shadow-2xl">
        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
          aria-label={TEXT.close}
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-8 sm:px-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{TEXT.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{TEXT.subtitle}</p>

          <div className="mt-4 flex justify-center gap-2">
            <a
              href="/contact"
              className="rounded-full border px-3 py-1 text-xs hover:bg-zinc-50"
            >
              {TEXT.contact}
            </a>

            <div className="inline-flex rounded-full border p-1 text-xs">
              <button
                className={`px-3 py-1 rounded-full ${
                  period === 'yearly' ? 'bg-zinc-900 text-white' : ''
                }`}
                onClick={() => setPeriod('yearly')}
              >
                {TEXT.yearly}
              </button>
              <button
                className={`px-3 py-1 rounded-full ${
                  period === 'monthly' ? 'bg-zinc-900 text-white' : ''
                }`}
                onClick={() => setPeriod('monthly')}
              >
                {TEXT.monthly}
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            今月の無料枠: {used ?? 0}/{limit ?? 3}
          </p>
        </div>

        {/* Plans */}
        <div className="px-6 py-8 sm:px-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              id={p.id}
              name={PLAN_NAMES[p.id]}
              features={PLAN_FEATURES[p.id]}
              price={period === 'monthly' ? p.priceMonthly : p.priceYearly}
              period={period}
              gradient={p.gradient}
              busy={busy}
              onClick={() => {
                setSelectedPlan(p.id);
                go(p.id);
              }}
            />
          ))}
        </div>

        {showLogin && (
          <div className="mx-auto mb-6 max-w-md border p-4">
            <p className="mb-2 text-sm font-semibold">{TEXT.signin}</p>
            <LoginInline onSuccess={() => selectedPlan && go(selectedPlan)} />
          </div>
        )}

        <div className="border-t px-6 py-4 text-xs text-zinc-500 flex justify-between">
          <span>
            {TEXT.footerLeft}{' '}
            <a className="underline" href="mailto:info@delvertrade.com">
              info@delvertrade.com
            </a>
          </span>
          <span className="hidden sm:block">{TEXT.footerRight}</span>
        </div>
      </div>
    </div>
  );
}

/* ===== Card ===== */

function PlanCard({
  id,
  name,
  features,
  price,
  period,
  gradient,
  onClick,
  busy,
}: {
  id: PlanId;
  name: string;
  features: string[];
  price: number;
  period: BillingPeriod;
  gradient: string;
  onClick: () => void;
  busy: boolean;
}) {
  const priceLabel = useMemo(
    () => (price === 0 ? '$0' : `$${price}`),
    [price]
  );

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-2 text-3xl font-bold">
        {priceLabel}
        <span className="ml-1 text-sm text-zinc-500">
          / {period === 'monthly' ? '月' : '年'}
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {features.map((f, i) => (
          <li key={i}>✓ {f}</li>
        ))}
      </ul>

      <button
        disabled={busy}
        onClick={onClick}
        className="mt-4 w-full rounded-xl bg-zinc-900 py-2 text-white"
      >
        {busy ? TEXT.cta.processing : TEXT.cta.upgrade}
      </button>
    </div>
  );
}
