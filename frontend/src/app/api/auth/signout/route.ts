// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { createServerClientWritable } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createServerClientWritable();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
