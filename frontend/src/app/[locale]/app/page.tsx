// src/app/[locale]/app/page.tsx
import { getEntitlement } from '@/lib/entitlement';
import UserAvatarButton from '@/components/account/UserAvatarButton';
import { RunPanel } from '@/components/run/RunPanel';
import NoticeCard from '@/components/NoticeCard';


export default async function Page() {
  const { premium, used, limit } = await getEntitlement();

  return (
    <>
      {/* ヘッダー */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-600 tracking-widest uppercase">
              Backtest Engine
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              戦略を数値で検証する
            </h1>
          </div>
          <UserAvatarButton />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <NoticeCard />
          <RunPanel />
        </div>
      </main>
    </>
  );
}
