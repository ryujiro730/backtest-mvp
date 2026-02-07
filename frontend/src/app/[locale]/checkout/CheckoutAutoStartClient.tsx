'use client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Plan = 'starter' | 'pro';
type Period = 'monthly' | 'yearly';

export default function CheckoutAutoStartClient({
  locale,
  plan,
  period,
}: {
  locale: 'ja' | 'en';
  plan: Plan;
  period: Period;
}) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  // 認証確認
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user));
  }, []);

  // 自動でCheckoutセッション作成
  useEffect(() => {
    (async () => {
      if (authed === null) return; // 判定待ち

      if (authed === false) {
        const next = `/${locale}/billing/checkout?plan=${plan}&period=${period}`;
        router.replace(`/${locale}/login?next=${encodeURIComponent(next)}`);
        return;
      }

      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;

        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ plan, period }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Failed to create checkout session');
        }

        const { url } = await res.json();
        window.location.href = url;
      } catch (e) {
        console.error(e);
        router.replace(`/${locale}/pricing?error=checkout`);
      }
    })();
  }, [authed, router, locale, plan, period]);

  return <div className="p-6 text-sm text-zinc-500">Redirecting to checkout…</div>;
}
