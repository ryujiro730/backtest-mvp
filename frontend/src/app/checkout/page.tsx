// Server Component（Suspense不要）
import CheckoutAutoStartClient from './CheckoutAutoStartClient';

type Plan = 'starter' | 'pro';
type Period = 'monthly' | 'yearly';

export const dynamic = 'force-dynamic';

export default function Page({
  params,
  searchParams,
}: {
  params: { locale: 'ja' | 'en' };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const locale = params.locale;
  const plan = (typeof searchParams.plan === 'string' ? searchParams.plan : 'pro') as Plan;
  const period = (typeof searchParams.period === 'string' ? searchParams.period : 'monthly') as Period;

  return <CheckoutAutoStartClient locale={locale} plan={plan} period={period} />;
}
