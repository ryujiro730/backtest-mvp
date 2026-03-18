"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (!user) {
    router.push(`/${locale}/login`);
    return null;
  }

  const isEmailUser = user.app_metadata?.provider === "email" ||
    user.identities?.some((id) => id.provider === "email");
  const emailVerified = Boolean(
    (user as any).email_confirmed_at ?? (user as any).confirmed_at
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href={`/${locale}/app`}
            className="rounded-md border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            ← アプリに戻る
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">アカウント設定</h1>
        </div>

        <div className="space-y-6">
          {/* アカウント情報 */}
          <AccountSection user={user} emailVerified={emailVerified} locale={locale} />

          {/* パスワード変更 */}
          {isEmailUser && <PasswordSection />}

          {/* Danger zone */}
          <DangerSection locale={locale} />
        </div>
      </div>
    </main>
  );
}

/* ─── アカウント情報セクション ─── */

function AccountSection({
  user,
  emailVerified,
  locale,
}: {
  user: User;
  emailVerified: boolean;
  locale: string;
}) {
  const [editEmail, setEditEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [resent, setResent] = useState(false);

  const changeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorking(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setWorking(false);
    if (error) return setMsg({ type: "error", text: error.message });
    setMsg({ type: "ok", text: "確認メールを送りました。新しいアドレスで受信してください。" });
    setEditEmail(false);
    setNewEmail("");
  };

  const resendVerification = async () => {
    if (!user.email) return;
    setWorking(true);
    await supabase.auth.resend({ type: "signup", email: user.email });
    setWorking(false);
    setResent(true);
  };

  return (
    <Card title="アカウント情報">
      {/* メールアドレス */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          メールアドレス
        </label>
        <div className="flex items-center gap-3">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {user.email ?? "—"}
          </span>
          <VerifiedBadge verified={emailVerified} />
        </div>
        {!emailVerified && (
          <div className="mt-2">
            {resent ? (
              <span className="text-xs text-green-600">✓ 確認メールを再送しました</span>
            ) : (
              <button
                onClick={resendVerification}
                disabled={working}
                className="text-xs text-sky-600 hover:underline disabled:opacity-50"
              >
                確認メールを再送する
              </button>
            )}
          </div>
        )}
      </div>

      {/* メール変更フォーム */}
      {editEmail ? (
        <form onSubmit={changeEmail} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">新しいメールアドレス</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              autoFocus
              className={inputCls}
              placeholder="new@example.com"
            />
          </div>
          {msg && (
            <p className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={working} className={primaryBtn}>
              {working ? "送信中…" : "変更メールを送る"}
            </button>
            <button
              type="button"
              onClick={() => { setEditEmail(false); setMsg(null); }}
              className={secondaryBtn}
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <div>
          {msg && (
            <p className={`mb-3 text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
          <button
            onClick={() => setEditEmail(true)}
            className={secondaryBtn}
          >
            メールアドレスを変更
          </button>
        </div>
      )}

      {/* ログインプロバイダ */}
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          ログイン方法
        </label>
        <div className="flex flex-wrap gap-2">
          {user.identities?.map((id) => (
            <span
              key={id.provider}
              className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize"
            >
              {id.provider}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ─── パスワード変更セクション ─── */

function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const pw = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (pw !== confirm) return setMsg({ type: "error", text: "パスワードが一致しません。" });
    if (pw.length < 8) return setMsg({ type: "error", text: "8文字以上で設定してください。" });

    setWorking(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setWorking(false);
    if (error) return setMsg({ type: "error", text: error.message });
    setMsg({ type: "ok", text: "パスワードを変更しました。" });
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Card title="パスワード">
      {!open ? (
        <div>
          {msg && (
            <p className={`mb-3 text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
          <button onClick={() => setOpen(true)} className={secondaryBtn}>
            パスワードを変更する
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">新しいパスワード</label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                className={inputCls + " pr-10"}
                placeholder="8文字以上"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              >
                <EyeIcon />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">確認用（もう一度）</label>
            <input
              name="confirm"
              type={showPw ? "text" : "password"}
              required
              className={inputCls}
            />
          </div>
          {msg && (
            <p className={`text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={working} className={primaryBtn}>
              {working ? "更新中…" : "パスワードを更新する"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setMsg(null); }}
              className={secondaryBtn}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

/* ─── 危険ゾーン ─── */

function DangerSection({ locale }: { locale: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    if (confirm !== "DELETE") return;
    setWorking(true);
    setError(null);
    const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setWorking(false);
      return setError(j.error ?? "エラーが発生しました。");
    }
    window.location.href = `/${locale}`;
  };

  return (
    <Card title="危険な操作" danger>
      {!open ? (
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
          </p>
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/50 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70 transition"
          >
            アカウントを削除する
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/50 px-4 py-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">⚠️ 本当に削除しますか？</p>
            <p className="text-xs text-red-600 dark:text-red-500">
              この操作は取り消せません。確認のため「DELETE」と入力してください。
            </p>
          </div>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 px-4 py-3 outline-none text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-200"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={deleteAccount}
              disabled={confirm !== "DELETE" || working}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {working ? "削除中…" : "完全に削除する"}
            </button>
            <button
              onClick={() => { setOpen(false); setConfirm(""); setError(null); }}
              className={secondaryBtn}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── 共通UI ─── */

function Card({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-white dark:bg-zinc-900 p-6 shadow-sm ${
      danger
        ? "border-red-200 dark:border-red-900/50"
        : "border-zinc-200/70 dark:border-white/10"
    }`}>
      <h2 className={`text-base font-semibold mb-4 ${
        danger ? "text-red-700 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
      }`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
      verified
        ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/40 dark:border-green-900/50 dark:text-green-400"
        : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400"
    }`}>
      {verified ? "✓ 確認済み" : "未確認"}
    </span>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-zinc-900 px-4 py-3 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-black/10";

const primaryBtn =
  "rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition";

const secondaryBtn =
  "rounded-xl border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition";
