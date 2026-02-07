export function must(name: string, v: string | undefined | null) {
  if (!v) throw new Error(`${name} missing`);
  return v;
}

export function getServerSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url: must('SUPABASE_URL', url), anon: must('NEXT_PUBLIC_SUPABASE_ANON_KEY', anon) };
}

export function getAdminSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url: must('SUPABASE_URL', url), key: must('SUPABASE_SERVICE_ROLE_KEY', key) };
}

export function getStripeKey() {
  return must('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
}

export function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
  const base = raw.startsWith('http') ? raw : `https://${raw}`;
  return base.replace(/\/+$/, '');
}
