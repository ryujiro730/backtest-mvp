// src/app/[locale]/components/HeaderAuthButtons.tsx
'use client';

import Link from 'next/link';

export default function HeaderAuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}

