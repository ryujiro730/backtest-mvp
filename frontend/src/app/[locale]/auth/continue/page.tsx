import { Suspense } from 'react';
import ContinueClient from './ContinueClient';

export const dynamic = 'force-dynamic'; // 事前レンダ誤爆の回避

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-center text-zinc-400">
          Loading…
        </div>
      </div>
    }>
      <ContinueClient />
    </Suspense>
  );
}
