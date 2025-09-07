// src/lib/entitlement.ts
// src/lib/entitlement.ts
import 'server-only';
import { supabaseServer } from '@/lib/supabase-ssr';
import { getActor } from '@/lib/actor';

const FREE_LIMIT = 3;

// Subscriptions の「有効」とみなす状態
const ACTIVE_STATUSES = ['active', 'trialing']; // 必要に応じて 'past_due' を含めてもOK

export async function getEntitlement() {
  const supabase = await supabaseServer();

  // 認証ユーザー（無ければ null）
  const { data: { user } } = await supabase.auth.getUser();

  // 匿名ID（middleware で付与してる想定）
  const { anon_id } = await getActor();

  // 月初〜翌月初（UTC）
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  // --- 1) 課金状態（premium）を判定 ---
  let premium = false;
  if (user) {
    const { data: sub, error: subErr } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ACTIVE_STATUSES)
      .maybeSingle();

    if (subErr) {
      // ログだけ出しておく（判定は false のまま）
      console.warn('subscriptions query error:', subErr);
    }
    premium = !!sub;
  }

  // --- 2) 今月の使用回数 ---
  // premium の場合はカウント不要（used=0 として扱う）でも良いが、
  // UI 表示用にカウントしたい場合はそのままカウントしてもOK
  let used = 0;

  // キー列は「ログイン済みなら user_id / 匿名なら anon_id」
  const keyCol = user ? 'user_id' : 'anon_id';
  const keyVal = user ? user.id : anon_id;

  if (!premium && keyVal) {
    // head:true + count:'exact' で件数だけ取る
    const { count, error: runErr } = await supabase
      .from('runs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', from.toISOString())
      .lt('created_at', to.toISOString())
      .eq(keyCol, keyVal);

    if (runErr) {
      console.warn('runs count error:', runErr);
    }
    used = count ?? 0;
  }

  // --- 3) free limit / exceeded を決定 ---
  const limit = premium ? undefined : FREE_LIMIT;
  const exceeded = premium ? false : used >= FREE_LIMIT;

  return {
    user: user ?? null,
    premium,
    used,
    limit,
    exceeded,
    anon_id,
  };
}
