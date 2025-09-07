// src/app/api/billing/portal/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // あなたの users テーブルに保存している stripe_customer_id を参照
  // ない場合は作成して保存する運用に合わせて書き換え
  const customerId = /* lookup from DB by user.id */ null as unknown as string;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: new URL('/', headers().get('origin') ?? 'http://localhost:3000').toString(),
  });
  return NextResponse.json({ url: session.url });
}

