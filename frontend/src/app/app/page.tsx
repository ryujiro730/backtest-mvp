// src/app/app/page.tsx
import { getEntitlement } from '@/lib/entitlement';
import UserAvatarButton from '@/components/account/UserAvatarButton';
import { RulesBuilder } from '@/rules/RulesBuilder';
import { RunPanel } from '@/components/run/RunPanel';


function DarkHeader() {
  return (
    <div
      className="
        relative
        overflow-hidden
        bg-gradient-to-r from-black via-zinc-900 to-red-900
        border border-white/10
        shadow-[0_12px_40px_rgba(0,0,0,0.7)]
        text-xs / text-sm
        tracking-widest
      "
    >
      {/* 光沢 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />

      <div className="relative px-6 py-5">
        <div className="text-xs tracking-widest text-red-400">
          STRATEGY EXECUTION CONSOLE
        </div>
        <h1 className="text-xl font-bold text-white">
          DELVER BACKTEST ENGINE
        </h1>
        <p className="mt-1 text-sm text-zinc-300">
          Quantitative strategy testing with controlled risk
        </p>
      </div>
    </div>
  );
}

export default async function Page() {
  const { premium, used, limit } = await getEntitlement();

  return (
    <>
      <DarkHeader />

      <main className="relative max-w-5xl mx-auto px-4 py-6 space-y-6">
        <UserAvatarButton className="absolute right-2 top-2" />
        <div className="mt-12 border-t border-white/10 pt-8">

          <RunPanel/>
        </div>
      </main>
    </>
  );
}
