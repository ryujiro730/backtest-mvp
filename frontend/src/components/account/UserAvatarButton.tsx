// src/components/account/UserAvatarButton.tsx
'use client';

import { useState } from 'react';
import AccountModal from '@/components/account/AccountModal';

export default function UserAvatarButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open account settings"
        className={`group inline-flex items-center justify-center h-10 w-10 rounded-full border border-zinc-200 bg-white shadow-sm hover:shadow transition ${className}`}
      >
        {/* シンプルな user-circle SVG */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-zinc-700 group-hover:text-black">
          <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.58-5-8-5Z"/>
        </svg>
      </button>

      <AccountModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
