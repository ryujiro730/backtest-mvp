// src/app/api/run/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getEntitlement } from '@/lib/entitlement';
import { getActor } from '@/lib/actor';
import crypto from 'node:crypto';

const FREE_MODE =
  process.env.NEXT_PUBLIC_FREE_MODE === '1' || process.env.FREE_MODE === '1';

export async function POST(req: NextRequest) {
  try {
    // ★ FREE_MODE のときは課金チェックをスキップ
    if (!FREE_MODE) {
      const { premium, exceeded, plan, freeQuotaLeft, user, anon_id } = await getEntitlement();
      if ((!premium && exceeded) || (plan === 'free' && (freeQuotaLeft ?? 0) <= 0)) {
        return NextResponse.json(
          { error: 'FREE_QUOTA_EXCEEDED', message: 'Free monthly quota exceeded' },
          { status: 402 }
        );
      }
    }

    const { ip, ua } = await getActor();
    const idemKey = req.headers.get('idempotency-key') ?? null;
    const admin = supabaseAdmin();

    const salt = process.env.HASH_SALT ?? '';
    const ipHash =
      ip && salt ? crypto.createHash('sha256').update(ip + salt).digest('hex') : null;

    const { error: insertErr } = await admin.from('runs').insert({
      id: crypto.randomUUID(),
      user_id: null, // 認証してるなら getEntitlement() から user?.id を利用
      anon_id: null,
      ip_hash: ipHash,
      user_agent: ua?.slice(0, 255) ?? null,
      idem_key: idemKey,
    });

    if (insertErr) {
      const msg = String(insertErr.message ?? insertErr);
      if (msg.includes('duplicate key') || msg.includes('unique')) {
        return NextResponse.json({ ok: true, deduped: true });
      }
      console.error('runs insert error:', insertErr);
      return NextResponse.json({ error: 'db_insert_failed' }, { status: 500 });
    }

    // await runJob(...)

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
