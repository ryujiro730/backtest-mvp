'use client';

import dynamic from 'next/dynamic';

const ChartPageClient = dynamic(() => import('./_ChartClient'), { ssr: false });

export default function ChartLoader() {
  return <ChartPageClient />;
}
