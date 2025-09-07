"use client";

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
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);

    // メール確認を有効にしている場合、確認メール送信後にログイン画面へ
    router.push(`${L}/login`);
  };

  return (
    <main className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10
                      bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8
                      text-zinc-900 dark:text-zinc-100">
        <h1 className="text-center text-2xl font-semibold mb-8">Create Your Account</h1>

        {/* Google（Supabase OAuth） */}
        <GoogleAuthButton label="Sign up with Google" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200/80 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/90 dark:bg-zinc-900/85 text-zinc-500 dark:text-zinc-400">
              or
            </span>
          </div>
        </div>

        {/* Email サインアップ */}
        <form onSubmit={onSubmit}>
          <label className="block text-sm mb-1">Email Address</label>
          <input
            name="email"
            type="email"
            className="mb-4 w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                       bg-white dark:bg-zinc-900 px-4 py-3 outline-none
                       text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                       focus:ring-2 focus:ring-black/10"
            required
          />

          <label className="block text-sm mb-1">Password</label>
          <div className="relative mb-6">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              className="w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                         bg-white dark:bg-zinc-900 px-4 py-3 pr-10 outline-none
                         text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                         focus:ring-2 focus:ring-black/10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>

          {msg && <p className="mb-3 text-sm text-red-600">{msg}</p>}

          <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href={`${L}/login`} className="text-sky-600 hover:underline">Login</Link>
          </p>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-6 py-3 text-white text-lg font-medium hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
