// src/app/[locale]/app/page.tsx
import { getEntitlement } from '@/lib/entitlement';
import RunClient from './RunClient';
import UserAvatarButton from '@/components/account/UserAvatarButton';

export default async function Page() {
  const { premium, used, limit } = await getEntitlement();

  return (
    <main className="relative max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* 右上のアバター（このmainの中で右上に配置） */}
      <UserAvatarButton className="absolute right-2 top-2" />

      <RunClient used={used ?? 0} limit={limit ?? 3} />
    </main>
  );
}
