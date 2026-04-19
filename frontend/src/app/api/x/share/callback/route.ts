// /frontend/src/app/api/x/share/callback/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getFlowState, clearFlowState } from '@/lib/session';
import { supabaseAdmin } from '@/lib/db'; // ← db.tsは関数で返す実装にしておく

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const to = (p: string) => NextResponse.redirect(new URL(p, url));

  if (!code || !state) return to('/share/error');

  // Cookie からフロー状態を復元
  const flow = await getFlowState(state);
  if (!flow?.verifier) return to('/share/error');

  // --- code → token 交換（PKCE）
  const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.X_CLIENT_ID!,
      redirect_uri: process.env.X_REDIRECT_URI!,
      code,
      code_verifier: flow.verifier,
    }),
    cache: 'no-store',
  });
  if (!tokenRes.ok) return to('/share/error');
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return to('/share/error');

  // --- ツイート
  const resultId = flow.resultId ?? 'unknown';
  const text =
    `このバックテスト結果をDelverで検証した。 https://delvertrade.com/app/results/${resultId} #fx #backtest`;

  const tweetRes = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
    cache: 'no-store',
  });
  if (!tweetRes.ok) return to('/share/error');
  const tweet = (await tweetRes.json()) as { data?: { id?: string } };
  const tweetId = tweet?.data?.id;
  if (!tweetId) return to('/share/error');

  // --- 付与処理（必要なら）
  try {
    const db = supabaseAdmin(); // ← ここで初期化（トップレベル禁止）
    // 重複に強い upsert（unique: user_id,result_id）を使う例
    await db.from('shares').upsert(
      { user_id: flow.userId ?? null, result_id: resultId, tweet_id: `tw_${tweetId}` },
      { onConflict: 'user_id,result_id', ignoreDuplicates: true }
    );

    // quota加算が必要ならRPCを用意して呼ぶのが安全（例）
    // if (flow.userId) await db.rpc('inc_quota', { uid: flow.userId });
  } catch {
    // ログ出すだけで継続可
  }

  // 後片付け
  await clearFlowState(state);
  return to(`/share/success?resultId=${encodeURIComponent(resultId)}`);
}
