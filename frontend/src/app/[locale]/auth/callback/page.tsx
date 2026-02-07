export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import AuthCallbackClient from './AuthCallbackClient';

export default function Page() {
  // 何もせずクライアントを描画するだけ
  return <AuthCallbackClient />;
}
