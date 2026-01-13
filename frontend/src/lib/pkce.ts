// src/lib/pkce.ts
// PKCE(S256) 生成ユーティリティ
import { randomBytes, createHash } from 'node:crypto';

export type Pkce = {
  code_verifier: string;
  code_challenge: string;
  method: 'S256';
};

function base64url(buf: Buffer) {
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export async function createPkce(): Promise<Pkce> {
  const verifier = base64url(randomBytes(32));                    // 43〜128文字推奨
  const challenge = base64url(createHash('sha256').update(verifier).digest());
  return { code_verifier: verifier, code_challenge: challenge, method: 'S256' };
}
