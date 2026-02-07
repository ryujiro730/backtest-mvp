import { Suspense } from 'react';
import AuthCallback from './CallbackClient';

export const dynamic = 'force-dynamic'; // 事前レンダ誤爆を防止

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center text-zinc-400">Redirecting…</p>}>
      <AuthCallback />
    </Suspense>
  );
}
