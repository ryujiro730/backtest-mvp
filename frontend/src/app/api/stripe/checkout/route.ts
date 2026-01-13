// /frontend/src/app/api/stripe/checkout/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Stripe from 'stripe';
import { NextResponse } from 'next/server';
// ※ これらの util が「トップレベルで cookies()/headers() や new してない」ことが前提
import { supabaseServer } from '@/lib/supabase-ssr';
import { supabaseAdmin } from '@/lib/supabase';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY missing');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

function getOrigin() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
  const base = raw.startsWith('http') ? raw : `https://${raw}`;
  return base.replace(/\/+$/, '');
}

export async function POST() {
  try {
    // 認証（サーバー側で毎回生成：トップレベル禁止）
    const supa = supabaseServer();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const admin = supabaseAdmin();

    // 既存カスタマー取得/作成
    const { data: link } = await admin
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = link?.customer_id as string | undefined;
    const stripe = getStripe();

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('stripe_customers')
        .insert({ user_id: user.id, customer_id: customerId });
    }

    const price = process.env.STRIPE_PRICE_PRO;
    if (!price) throw new Error('STRIPE_PRICE_PRO missing');

    const origin = getOrigin();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/billing/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/checkout/cancel`,
      customer: customerId!,
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('checkout error:', e);
    return NextResponse.json({ error: e?.message ?? 'checkout_failed' }, { status: 500 });
  }
}
