export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default async function LoginIndexPage(
  props: {
    params: Promise<{ locale: "ja" | "en" }>;
    searchParams: Promise<{ next?: string; error?: string }>;
  }
) {
  const { locale } = await props.params;
  const { next, error } = await props.searchParams;
  const L = `/${locale}`;
  const nextParam = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200/70 dark:border-white/10
                      bg-white/90 dark:bg-zinc-900/85 shadow-sm backdrop-blur px-6 py-8
                      text-zinc-900 dark:text-zinc-100"
      >
        <h1 className="text-center text-2xl font-semibold mb-2">Delver にログイン</h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          続けるにはログインが必要です
        </p>

        {error === "auth" && (
          <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            認証に失敗しました。もう一度お試しください。
          </p>
        )}

        {/* Google OAuth */}
        <GoogleAuthButton label="Google でログイン" />

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

        {/* Email ログイン */}
        <Link
          href={`${L}/login/email${nextParam}`}
          className="block w-full rounded-xl border border-zinc-300/80 dark:border-white/10
                     bg-white/95 dark:bg-zinc-900/60 px-4 py-3 text-center shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition
                     text-zinc-900 dark:text-zinc-100"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-sm font-medium">メールでログイン</span>
          </div>
        </Link>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          アカウントをお持ちでない方は{" "}
          <Link href={`${L}/signup`} className="text-sky-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
