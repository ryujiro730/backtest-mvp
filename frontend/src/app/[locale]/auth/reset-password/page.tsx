"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function ResetPasswordForm({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setInitError("リセットリンクが無効か期限切れです。");
        else setReady(true);
      });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
        else setInitError("リセットリンクが無効か期限切れです。");
      });
    }
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) return setError("パスワードが一致しません。");
    if (password.length < 8) return setError("パスワードは8文字以上で設定してください。");

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => router.push(`/${locale}/app`), 2000);
  };

  if (initError) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="text-xl font-semibold mb-3">リンクが無効です</h1>
        <p className="text-sm text-zinc-500 mb-6">{initError}</p>
        <Link href={`/${locale}/forgot`} className="text-sm text-sky-600 hover:underline">
          もう一度リセットメールを送る
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h1 className="text-xl font-semibold mb-2">パスワードを更新しました</h1>
        <p className="text-sm text-zinc-500">アプリにリダイレクトします…</p>
      </div>
    );
  }

  if (!ready) {
    return <p className="text-center text-sm text-zinc-500">確認中…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-center text-2xl font-semibold mb-2">新しいパスワードを設定</h1>

      <div>
        <label className="block text-sm mb-1">新しいパスワード</label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            required
            minLength={8}
            className="w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                       bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none
                       text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-black/10"
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
        <label className="block text-sm mb-1">確認用（もう一度入力）</label>
        <input
          name="confirm"
          type={showPw ? "text" : "password"}
          required
          className="w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                     bg-white dark:bg-zinc-900 px-4 py-3 outline-none
                     text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-black/10"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-black px-6 py-3 text-white font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "更新中…" : "パスワードを更新する"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8 text-zinc-900 dark:text-zinc-100">
        <Suspense fallback={<p className="text-center text-sm text-zinc-500">Loading…</p>}>
          <ResetPasswordForm locale={locale} />
        </Suspense>
      </div>
    </main>
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
