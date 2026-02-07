// src/components/billing/PricingCtaClient.tsx
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import PaywallDialog from '@/components/billing/PaywallDialog';

export default function PricingCtaClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
<button
  onClick={() => setOpen(true)}
  className="
    mt-6 w-full 
    rounded-lg bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 
    px-4 py-2 text-sm font-medium text-white 
    shadow hover:opacity-90 transition
  "
>
  今すぐ申し込む
</button>


      {open &&
        typeof window !== 'undefined' &&
        createPortal(
          <PaywallDialog open={open} onOpenChange={setOpen} />,
          document.body
        )}
    </>
  );
}
