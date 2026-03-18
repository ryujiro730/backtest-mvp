"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignupPage() {
  const { locale } = useParams<{ locale: "ja" | "en" }>();
  const router = useRouter();
  const L = `/${locale}`;

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

    if (password.length < 8) {
      setLoading(false);
      return setMsg("パスワードは8文字以上で設定してください。");
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);

    if (data.session) {
      // メール確認なし（即時ログイン）
      router.push(`${L}/app`);
    } else {
      // メール確認が必要
      router.push(`${L}/auth/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10
                      bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8
                      text-zinc-900 dark:text-zinc-100"
      >
        <h1 className="text-center text-2xl font-semibold mb-2">アカウントを作成</h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          無料で始められます
        </p>

        {/* Google サインアップ */}
        <GoogleAuthButton label="Google で登録" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200/80 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/90 dark:bg-zinc-900/85 text-zinc-500 dark:text-zinc-400">
              または
            </span>
          </div>
        </div>

        {/* Email サインアップ */}
        <form onSubmit={onSubmit}>
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
            placeholder="you@example.com"
          />

          <label className="block text-sm mb-1">パスワード</label>
          <div className="relative mb-6">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                         bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none
                         text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                         focus:ring-2 focus:ring-black/10"
              placeholder="8文字以上"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {msg && <p className="mb-4 text-sm text-red-600">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-6 py-3 text-white text-base font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "登録中…" : "アカウントを作成"}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            すでにアカウントをお持ちの方は{" "}
            <Link href={`${L}/login`} className="text-sky-600 hover:underline">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
