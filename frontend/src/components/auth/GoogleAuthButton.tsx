'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function GoogleAuthButton({ label = 'Continue with Google' }: { label?: string }) {
  const { locale } = useParams<{ locale: 'ja' | 'en' }>();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    const next = searchParams.get('next') ?? `/${locale}/app`;
    window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}&locale=${locale}`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="flex items-center justify-center w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 transition"
    >
      <svg
        className="mr-2 h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path fill="#EA4335" d="M24 9.5c3.94 0 6.6 1.7 8.1 3.1l5.9-5.9C34.6 3.6 29.8 1.5 24 1.5 14.8 1.5 7 7.9 4 16.3l6.9 5.4C12.4 15.6 17.7 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.9c-.3 2-1.7 5-4.9 7l7.6 5.9c4.4-4.1 7-10.1 7-16.6z"/>
        <path fill="#4A90E2" d="M24 47c6.5 0 11.9-2.1 15.8-5.7l-7.6-5.9c-2.1 1.5-4.9 2.5-8.2 2.5-6.3 0-11.6-4.2-13.5-9.9l-7.8 6c3 8.3 11 13 21.3 13z"/>
        <path fill="#FBBC05" d="M10.5 28c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-7.8-6C1.6 15.6 1 19 1 23s.6 7.4 1.7 10.5l7.8-6z"/>
      </svg>
      {loading ? 'Redirecting...' : label}
    </button>
  );
}
