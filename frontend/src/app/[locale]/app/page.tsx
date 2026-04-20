// src/app/[locale]/app/page.tsx
import { getEntitlement } from '@/lib/entitlement';
import UserAvatarButton from '@/components/account/UserAvatarButton';
import { RunPanel } from '@/components/run/RunPanel';
import NoticeCard from '@/components/NoticeCard';
import { Link } from '@/i18n/routing';
import { Scissors } from 'lucide-react';

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  await params; // locale is not needed here
  const { used, premium } = await getEntitlement();

  return (
    <>
      {/* ヘッダー */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 group">
            <div className="text-[10px] font-semibold text-emerald-600 tracking-widest uppercase group-hover:text-emerald-700 transition">
              Delver
            </div>
            <div className="text-base font-bold text-slate-900 leading-tight group-hover:text-slate-700 transition sm:text-lg">
              バックテスト
            </div>
          </Link>

          <Link
            href="/chart"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition sm:px-3"
          >
            <Scissors className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">手動裁量検証モード</span>
          </Link>

          <UserAvatarButton />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <NoticeCard />
          <RunPanel used={used} premium={premium} />
        </div>
      </main>
    </>
  );
}
