// src/app/api/run/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getEntitlement } from '@/lib/entitlement';
import { getActor } from '@/lib/actor';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const { premium, exceeded, user, anon_id } = await getEntitlement();
    const { ip, ua } = await getActor();

    // 無料枠超過 → 課金導線へ
    if (!premium && exceeded) {
      return NextResponse.json({ error: 'paywall' }, { status: 402 });
    }

    // --- 任意: Idempotency-Key で多重実行防止 -------------------------
    const idemKey = req.headers.get('idempotency-key') ?? null;
    // runs テーブル側に unique index (idem_key) を付けると堅い
    // CREATE UNIQUE INDEX runs_idem_key_uidx ON runs(idem_key) WHERE idem_key IS NOT NULL;

    const admin = supabaseAdmin();

    // IP ハッシュ（塩は必須じゃないけど、あればより安全）
    const salt = process.env.HASH_SALT ?? '';
    const ipHash =
      ip && salt
        ? crypto.createHash('sha256').update(ip + salt).digest('hex')
        : null;

    // 実行レコードを記録（有料/無料どちらでも記録推奨）
    const { error: insertErr } = await admin.from('runs').insert({
      id: crypto.randomUUID(),
      user_id: user?.id ?? null,
      anon_id: anon_id ?? null,
      ip_hash: ipHash,
      user_agent: ua?.slice(0, 255) ?? null,
      idem_key: idemKey, // 列がなければ省略
    });

    // Idempotency の二重送信などでぶつかった場合は 200 返してもよい
    if (insertErr) {
      // 一意制約違反（idem_key）の場合は「既に受理済み」として200にしてもOK
      const msg = String(insertErr.message ?? insertErr);
      if (msg.includes('duplicate key') || msg.includes('unique')) {
        return NextResponse.json({ ok: true, deduped: true });
      }
      console.error('runs insert error:', insertErr);
      return NextResponse.json({ error: 'db_insert_failed' }, { status: 500 });
    }

    // ここで実ジョブを起動する（外部 API 等）
    // await runJob(...)

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
