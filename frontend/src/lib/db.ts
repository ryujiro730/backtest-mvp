import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAdminSupabase } from './env';

export function supabaseAdmin(): SupabaseClient {
  const { url, key } = getAdminSupabase();
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
