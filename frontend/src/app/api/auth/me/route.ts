import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-ssr';

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({ user: user ? { id: user.id, email: user.email } : null });
}

