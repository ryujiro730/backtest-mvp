// src/app/[locale]/components/HeaderAuthButtons.tsx
'use client';

import { Link } from '@/i18n/routing';

export default function HeaderAuthButtons({ variant }: { variant: 'dark' | 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className={`text-sm ${isDark ? 'text-white' : 'text-zinc-800 hover:text-zinc-900'}`}
      >
        Login
      </Link>
      <Link
        href="/signup"
        className={`btn-sm rounded-md px-4 py-2 font-medium ${
          isDark
            ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Sign Up
      </Link>
    </div>
  );
}

