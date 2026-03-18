import { NextResponse } from "next/server";
import { createServerClientWritable } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE() {
  const supabase = createServerClientWritable();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // service_role でユーザーを削除
  const admin = supabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // セッションをクリア
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
