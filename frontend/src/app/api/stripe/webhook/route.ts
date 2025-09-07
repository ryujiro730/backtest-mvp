import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return NextResponse.json({ error: `Webhook Error: ${e.message}` }, { status: 400 });
  }

  const admin = supabaseAdmin();

  const upsertSub = async (sub: Stripe.Subscription) => {
    const customerId = sub.customer as string;
    const { data: link } = await admin
      .from('stripe_customers').select('user_id').eq('customer_id', customerId).single();
    if (!link?.user_id) return;

    await admin.from('subscriptions').upsert({
      id: sub.id,
      user_id: link.user_id,
      status: sub.status,
      price_id: (sub.items.data[0]?.price.id) ?? null,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString()
    });
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      // 直後はsubscriptionは別イベントで来ることがあるのでここでは何もしないor補助的に取得
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSub(sub);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSub(sub);
      break;
    }
    default:
      // 必要ならinvoice.payment_succeeded等もハンドリング
      break;
  }

  return NextResponse.json({ received: true });
}

// Webhookはraw bodyが必要なため、App Routerの設定でbodyParser無効が既定。
// Vercel/Supabase Functionsでも同様に動く。
