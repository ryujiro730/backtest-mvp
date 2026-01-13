// src/app/api/x/share/start/route.ts
// 認可開始：state/PKCE を生成→保存→Xの認可URLへリダイレクト
import { NextResponse } from 'next/server';
import { createPkce } from '@/lib/pkce';
import { saveFlowState } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { code_verifier, code_challenge, method } = await createPkce();
  const state = crypto.randomUUID();

  // 共有対象があればここで付与して保存（任意）
  // 例）?resultId=xxx を拾う:
  const url = new URL(req.url);
  const resultId = url.searchParams.get('resultId') ?? null;
  const userId = url.searchParams.get('userId') ?? null;

  saveFlowState({ state, verifier: code_verifier, userId, resultId });

  const auth = new URL('https://twitter.com/i/oauth2/authorize');
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('client_id', process.env.X_CLIENT_ID!);
  auth.searchParams.set('redirect_uri', process.env.X_REDIRECT_URI!); // 例: https://delvertrade.com/api/x/share/callback
  auth.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
  auth.searchParams.set('state', state);
  auth.searchParams.set('code_challenge', code_challenge);
  auth.searchParams.set('code_challenge_method', method);

  return NextResponse.redirect(auth.toString());
}
