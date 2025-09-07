// src/app/api/entitlement/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-ssr';
import { getEntitlement } from '@/lib/entitlement';

export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 200 });

  const e = await getEntitlement(); // 既存ロジックをそのまま利用（server-only）
  return NextResponse.json({
    authenticated: true,
    premium: e.premium,
    used: e.used ?? 0,
    limit: e.limit ?? 3,
    nextBillingAt: e.nextBillingAt ?? null,
    freeQuotaLeft: e.freeQuotaLeft ?? null,
  });
}
