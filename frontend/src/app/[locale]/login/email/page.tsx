"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function LoginEmailForm({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? `/${locale}/app`;

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    router.push(next);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10
                 bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8
                 text-zinc-900 dark:text-zinc-100"
      autoComplete="on"
    >
      <h1 className="text-center text-2xl font-semibold mb-8">メールでログイン</h1>

      <label className="block text-sm mb-1">メールアドレス</label>
      <input
        name="email"
        type="email"
        autoComplete="email"
        required
        className="mb-4 w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                   bg-white dark:bg-zinc-900 px-4 py-3 outline-none
                   text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                   focus:ring-2 focus:ring-black/10"
      />

      <label className="block text-sm mb-1">パスワード</label>
      <div className="relative mb-2">
        <input
          name="password"
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                     bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none
                     text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                     focus:ring-2 focus:ring-black/10"
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
          aria-label={showPw ? "Hide password" : "Show password"}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      <div className="mb-6">
        <Link href={`/${locale}/forgot`} className="text-xs text-sky-600 hover:underline">
          パスワードを忘れた場合はこちら
        </Link>
      </div>

      {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-6 py-3 text-white text-base font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "ログイン中…" : "ログイン"}
      </button>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        アカウントをお持ちでない方は{" "}
        <Link href={`/${locale}/signup`} className="text-sky-600 hover:underline">
          新規登録
        </Link>
      </p>
    </form>
  );
}

export default function LoginWithEmailPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-12">
      <Suspense fallback={null}>
        <LoginEmailForm locale={locale} />
      </Suspense>
    </main>
  );
}
