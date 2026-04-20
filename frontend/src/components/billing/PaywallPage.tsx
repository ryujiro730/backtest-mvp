'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Check, Zap, BarChart2 } from 'lucide-react';

type Period = 'monthly' | 'yearly';
type PlanId = 'pro';

const PLANS: Array<{
  id: PlanId;
  nameJa: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlight?: boolean;
}> = [
  {
    id: 'pro',
    nameJa: 'Pro',
    priceMonthly: 5000,
    priceYearly: 50000,
    features: [
      'バックテスト 無制限',
      'チャート検証 無制限',
      '全通貨ペア対応',
      '25年分データ',
      '優先サポート',
    ],
    highlight: true,
  },
];

export default function PaywallPage({ returnPath }: { returnPath?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('monthly');
  const [busy, setBusy] = useState<PlanId | null>(null);

  const checkout = async (plan: PlanId) => {
    setBusy(plan);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        router.push(`/${locale}/login?next=${encodeURIComponent(returnPath ?? `/${locale}/app`)}`);
        return;
      }
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, period }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: any) {
      alert(e.message ?? 'チェックアウトに失敗しました');
      setBusy(null);
    }
  };

  const yearlyDiscount = Math.round((1 - 50000 / (5000 * 12)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-700 mb-4">
          <Zap className="h-3.5 w-3.5" />
          無料枠を使い切りました
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          プランを選んで続ける
        </h1>
        <p className="mt-3 text-slate-600 text-sm leading-relaxed">
          25年分のFXデータで、手法の本当の実力をデータで確認してください。<br />
          いつでもキャンセル可能。Stripe により安全に処理されます。
        </p>
      </div>

      {/* Period toggle */}
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm mb-8 shadow-sm">
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-5 py-2 rounded-full transition font-medium ${
            period === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          月払い
        </button>
        <button
          onClick={() => setPeriod('yearly')}
          className={`px-5 py-2 rounded-full transition font-medium flex items-center gap-1.5 ${
            period === 'yearly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          年払い
          <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
            period === 'yearly' ? 'bg-emerald-400 text-emerald-900' : 'bg-emerald-100 text-emerald-700'
          }`}>
            -{yearlyDiscount}%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 w-full max-w-sm">
        {PLANS.map((plan) => {
          const price = period === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const isBusy = busy === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 bg-white flex flex-col ${
                plan.highlight
                  ? 'border-emerald-400 shadow-lg shadow-emerald-100 ring-2 ring-emerald-400/30'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    おすすめ
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className={`h-4 w-4 ${plan.highlight ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold text-slate-700">{plan.nameJa}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  ¥{price.toLocaleString()}
                  <span className="text-base font-normal text-slate-500 ml-1">
                    / {period === 'monthly' ? '月' : '年'}
                  </span>
                </div>
                {period === 'yearly' && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    月あたり ¥{Math.round(price / 12).toLocaleString()}
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={!!busy}
                onClick={() => checkout(plan.id)}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-700 text-white'
                } disabled:opacity-50`}
              >
                {isBusy ? '処理中…' : `${plan.nameJa}を始める`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        いつでもキャンセル可能 ·{' '}
        <a href="mailto:info@delvertrade.com" className="underline hover:text-slate-600">
          お問い合わせ
        </a>
      </p>
    </div>
  );
}
