// Server component wrapper — auth + plan guard
import { getEntitlement } from '@/lib/entitlement';
import { redirect } from 'next/navigation';
import PaywallPage from '@/components/billing/PaywallPage';
import ChartLoader from './_ChartLoader';

type Props = { params: Promise<{ locale: string }> };

export default async function ChartPage({ params }: Props) {
  const { locale } = await params;
  const { user, premium } = await getEntitlement();

  if (!user) {
    redirect(`/${locale}/login?next=/${locale}/chart`);
  }

  if (!premium) {
    return <PaywallPage returnPath={`/${locale}/chart`} />;
  }

  return <ChartLoader />;
}
