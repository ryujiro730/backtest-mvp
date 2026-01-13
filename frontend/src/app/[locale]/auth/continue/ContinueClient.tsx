'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import LoginInline from '@/components/auth/LoginInline';

type Plan = 'free' | 'starter' | 'pro';
type Period = 'monthly' | 'yearly';

export default function ContinueClient() {
  const params = useSearchParams();
  const router = useRouter();

  // 1) next が来ていればそれを使う
  const nextFromParam = params.get('next');

  // 2) 無ければ plan / period から組み立て（フォールバック）
  const plan = (params.get('plan') ?? 'pro') as Plan;
  const period = (params.get('period') ?? 'monthly') as Period;

  const fallbackNext = `/billing/checkout?plan=${plan}&period=${period}`;

  const next = nextFromParam ?? fallbackNext;

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <h1 className="mb-3 text-lg font-semibold">ログインして続行</h1>
        <p className="mb-4 text-sm text-zinc-400">
          続行すると、選択したプランのチェックアウトに進みます。
        </p>
        <LoginInline next={next} onSuccess={() => router.push(next)} />
      </div>
    </div>
  );
}
