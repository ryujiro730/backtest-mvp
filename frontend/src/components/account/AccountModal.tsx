// src/components/account/AccountModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import PaywallDialog from '@/components/billing/PaywallDialog';
import { flags } from '@/lib/flags';
type Plan = 'free' | 'starter' | 'pro';
type BillingInfo = {
  plan: Plan;
  nextBillingAt?: string | null;
};

export default function AccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'account' | 'payments'>('account');
  const [loading, setLoading] = useState(true);

  // account info
  const [email, setEmail] = useState<string>('');
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

// billing info（/api/account/plan の真値）
const [billing, setBilling] = useState<BillingInfo>({ plan: 'free' });

  // small busy state for actions
  const [working, setWorking] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // 初期ロード（モーダルを開いたときだけ）
  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);

      // 認証ユーザーの基本情報
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? '');
      // v2 では email_confirmed_at（Eメール）/ confirmed_at（OAuth）どちらかが埋まる想定
      setEmailVerified(Boolean((user as any)?.email_confirmed_at ?? (user as any)?.confirmed_at));

// 課金状態（真値）
const { data: sess } = await supabase.auth.getSession();
const access = sess.session?.access_token ?? "";
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
  setWorking("logout");
  try {
    await fetch("/api/auth/signout", { method: "POST" }); // ← supabase.auth.signOut() は呼ばない
  } finally {
    setWorking(null);
    window.location.href = "/";
  }
};




  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      {/* modal */}
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
                Account info
                  </button>
  {/* FREEモードではPaymentsタブを非表示 */}
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
</aside>

            {/* body */}
            <section className="flex-1 overflow-y-auto">
              <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                <h2 className="text-xl font-semibold">Account Settings</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  disabled={!!working}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50"
                >
                  {working === 'logout' ? 'Logging out…' : 'Log out'}
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
      working={working}
      setWorking={setWorking}
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
  {/* Paywall ダイアログ */}
　 <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />

    </div>
  );
}

/* ---------------- Account Tab (簡素版) ---------------- */

function AccountTab({
  email,
  emailVerified,
  working,
  setWorking,
}: {
  email: string;
  emailVerified: boolean;
  working: string | null;
  setWorking: (v: string | null) => void;
}) {
  const onChangeEmail = async () => {
    const next = prompt('New email address');
    if (!next) return;
    setWorking('email');
    const { error } = await supabase.auth.updateUser({ email: next });
    setWorking(null);
    if (error) return alert(error.message);
    alert('Verification email sent to new address. Please confirm.');
  };

  const onDelete = async () => {
    const sure = confirm('Delete account permanently? This cannot be undone.');
    if (!sure) return;
    alert('Implement: call server-side admin route to delete user in Supabase.');
  };

  return (
    <div className="space-y-8">
      {/* 現在ログイン中のアカウント（メール）を明確に表示 */}
      <section>
        <h3 className="mb-3 text-lg font-semibold">Logged in</h3>
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
          <div className="font-medium">{email || '—'}</div>
          <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
            {emailVerified ? '✔ Verified' : 'Unverified'}
          </span>
          <button
            className="ml-auto rounded-md border px-3 py-1 hover:bg-zinc-50"
            onClick={onChangeEmail}
            disabled={!!working}
          >
            Change Email
          </button>
        </div>
      </section>

      <section className="border-t pt-4">
        <h3 className="mb-3 text-lg font-semibold">Delete Account</h3>
        <button
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
          onClick={onDelete}
          disabled={!!working}
        >
          Delete
        </button>
      </section>
    </div>
  );
}

/* ---------------- Payments Tab ---------------- */

function PaymentsTab({
  plan,
  nextBillingAt,
  working,
  setWorking,
  onUpgrade, // ← もう不要なら削ってOK
}: {
  plan: Plan;
  nextBillingAt: string | null;
  working: string | null;
  setWorking: (v: string | null) => void;
  onUpgrade: () => void;
}) {
  // 既存：Portal
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

  // 追加：Free→Checkout（サブスク開始）
// PaymentsTab 内
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
      body: JSON.stringify({ plan: 'pro', period: 'monthly' }), // ← これだけでOK
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
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">Current Plan</div>
            <div className="text-lg font-semibold">
              {plan === 'pro' ? 'Pro' : plan === 'starter' ? 'Starter' : 'Free'}
            </div>

            {plan === 'free' ? (
              <button
                onClick={onUpgradeToPro}
                disabled={!!working}
                className="rounded-lg bg-black px-4 py-2 text-white hover:bg-zinc-800"
              >
                Upgrade
              </button>
            ) : (
              <button
                onClick={onOpenPortal}
                disabled={!!working}
                className="rounded-lg border px-4 py-2 hover:bg-zinc-50"
              >
                Manage subscription
              </button>
            )}
          </div>

          {plan === 'free' ? (
            <p className="mt-2 text-sm text-zinc-600">Free plan with limited monthly runs.</p>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">
              Next billing: {nextBillingAt ? new Date(nextBillingAt).toLocaleDateString() : '—'}
              <br />
              {plan === 'starter' ? 'Starter: up to 30 runs / day' : 'Pro: unlimited runs'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
