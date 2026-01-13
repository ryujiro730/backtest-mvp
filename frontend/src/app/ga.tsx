'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function GA({ gaId }: { gaId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaId || typeof window === 'undefined') return;
    if (typeof window.gtag !== 'function') return;

    // search は window.location.search から直接取得（Suspense不要）
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const page_path = search ? `${pathname}${search}` : pathname;

    window.gtag('config', gaId, { page_path });
  }, [gaId, pathname]);

  return null;
}
