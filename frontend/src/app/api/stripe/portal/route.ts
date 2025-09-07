import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/src/lib/supabase-ssr';
import { supabaseAdmin } from '@/src/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: link, error } = await admin
    .from('stripe_customers').select('customer_id').eq('user_id', user.id).single();
  if (error || !link) return NextResponse.json({ error: 'No customer' }, { status: 400 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: link.customer_id,
    return_url: `${process.env.APP_URL}/settings/billing`
  });

  return NextResponse.json({ url: portal.url });
}
