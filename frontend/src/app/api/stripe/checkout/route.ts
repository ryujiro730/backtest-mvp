import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-ssr';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST() {
  try {
    // ← ここで必ずログイン済みを要求
    const supa = supabaseServer();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Supabaseに保存してる customer_id を取得（なければ作る）
    const admin = supabaseAdmin();
    const { data: link } = await admin.from('stripe_customers')
      .select('customer_id').eq('user_id', user.id).single();

    let customerId = link?.customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email ?? undefined });
      customerId = customer.id;
      await admin.from('stripe_customers').insert({ user_id: user.id, customer_id: customerId }).select().single();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.APP_URL}/billing/success`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e:any) {
    console.error('checkout error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
