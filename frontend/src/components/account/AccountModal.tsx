// src/components/account/AccountModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import PaywallDialog from '@/components/billing/PaywallDialog';
import { flags } from '@/lib/flags';

type Plan = 'free' | 'starter' | 'pro';
type BillingInfo = { plan: Plan; nextBillingAt?: string | null };

export default function AccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { locale } = useParams<{ locale: 'ja' | 'en' }>();
  const router = useRouter();
  const [tab, setTab] = useState<'account' | 'payments'>('account');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [billing, setBilling] = useState<BillingInfo>({ plan: 'free' });
  const [working, setWorking] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? '');
      setEmailVerified(Boolean((user as any)?.email_confirmed_at ?? (user as any)?.confirmed_at));
      const { data: sess } = await supabase.auth.getSession();
      const access = sess.session?.access_token ?? '';
      const res = await fetch('/api/account/plan', {
        cache: 'no-store',
        credentials: 'include',
        headers: access ? { Authorization: `Bearer ${access}` } : {},
      });
      if (res.ok) {
        const j = await res.json();
        setBilling({ plan: j.plan as Plan, nextBillingAt: j.nextBillingAt ?? null });
      }
      setLoading(false);
    })();
  }, [open]);

  const planLabel = useMemo(() => (
    billing.plan === 'pro' ? 'Pro' :
    billing.plan === 'starter' ? 'Starter' : 'Free'
  ), [billing.plan]);

  const onLogout = async () => {
    if (working) return;
    setWorking('logout');
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      setWorking(null);
      window.location.href = '/';
    }
  };

  const goToSettings = () => {
    onClose();
    router.push(`/${locale}/settings`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex h-[520px]">
            {/* left rail */}
            <aside className="w-48 border-r border-zinc-200 bg-zinc-50 p-3">
              <button
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  tab === 'account' ? 'bg-white shadow border' : 'text-zinc-600 hover:bg-white'
                }`}
                onClick={() => setTab('account')}
              >
                アカウント情報
              </button>
              {!flags.freeMode && (
                <button
                  className={`mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    tab === 'payments' ? 'bg-white shadow border' : 'text-zinc-600 hover:bg-white'
                  }`}
                  onClick={() => setTab('payments')}
                >
                  Payments
                </button>
              )}
              <button
                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-white"
                onClick={goToSettings}
              >
                設定 →
              </button>
            </aside>

            {/* body */}
            <section className="flex-1 overflow-y-auto">
              <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                <h2 className="text-xl font-semibold">アカウント設定</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onLogout}
                    disabled={!!working}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {working === 'logout' ? 'ログアウト中…' : 'ログアウト'}
                  </button>
                  <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100" aria-label="Close">
                    ✕
                  </button>
                </div>
              </header>

              <div className="p-6">
                {loading ? (
                  <div className="text-sm text-zinc-500">Loading…</div>
                ) : tab === 'account' ? (
                  <AccountTab
                    email={email}
                    emailVerified={emailVerified}
                    onGoToSettings={goToSettings}
                  />
                ) : !flags.freeMode ? (
                  <PaymentsTab
                    plan={billing.plan}
                    nextBillingAt={billing.nextBillingAt ?? null}
                    working={working}
                    setWorking={setWorking}
                    onUpgrade={() => setShowPaywall(true)}
                  />
                ) : (
                  <div className="text-sm text-zinc-500">This feature is disabled in Free Mode.</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
}

/* ─── Account Tab ─── */

function AccountTab({
  email,
  emailVerified,
  onGoToSettings,
}: {
  email: string;
  emailVerified: boolean;
  onGoToSettings: () => void;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-base font-semibold">ログイン中のアカウント</h3>
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <div className="font-medium text-zinc-900">{email || '—'}</div>
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${
            emailVerified
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}>
            {emailVerified ? '✔ 確認済み' : '未確認'}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4">
        <p className="text-sm text-zinc-600 mb-3">
          メールアドレスの変更、パスワードの変更、アカウントの削除は設定ページから行えます。
        </p>
        <button
          onClick={onGoToSettings}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition"
        >
          設定ページへ →
        </button>
      </section>
    </div>
  );
}

/* ─── Payments Tab ─── */

function PaymentsTab({
  plan,
  nextBillingAt,
  working,
  setWorking,
  onUpgrade,
}: {
  plan: Plan;
  nextBillingAt: string | null;
  working: string | null;
  setWorking: (v: string | null) => void;
  onUpgrade: () => void;
}) {
  const onOpenPortal = async () => {
    setWorking('portal');
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to create portal session');
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: any) {
      alert(e.message ?? 'Portal open failed');
    } finally {
      setWorking(null);
    }
  };

  const onUpgradeToPro = async () => {
    setWorking('checkout');
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: 'pro', period: 'monthly' }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: any) {
      alert(e.message ?? 'Checkout failed');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4">
        <div className="mb-3">
          <div className="text-sm text-zinc-500">Current Plan</div>
          <div className="text-lg font-semibold">
            {plan === 'pro' ? 'Pro' : plan === 'starter' ? 'Starter' : 'Free'}
          </div>
        </div>

        {plan === 'free' ? (
          <>
            <p className="mb-3 text-sm text-zinc-600">Free plan with limited monthly runs.</p>
            <button
              onClick={onUpgradeToPro}
              disabled={!!working}
              className="rounded-lg bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {working === 'checkout' ? 'Redirecting…' : 'Upgrade'}
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-zinc-600">
              Next billing: {nextBillingAt ? new Date(nextBillingAt).toLocaleDateString() : '—'}
              <br />
              {plan === 'starter' ? 'Starter: up to 30 runs / day' : 'Pro: unlimited runs'}
            </p>
            <button
              onClick={onOpenPortal}
              disabled={!!working}
              className="rounded-lg border px-4 py-2 hover:bg-zinc-50 disabled:opacity-50"
            >
              {working === 'portal' ? 'Opening…' : 'Manage subscription'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
