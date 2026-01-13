/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// OGはクローラーから毎回呼ばれる想定。最新を返したいなら:
export const revalidate = 60; // 1分キャッシュ（任意）

export default async function OpengraphImage({ params }: { params: { id: string; locale: string } }) {
  const id = params.id;

  // ✅ クローラーが認証無しで読めるエンドポイントから取得（重要）
  // ここをログイン不要の公開APIにしておくこと
  const api = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await fetch(`${api}/public/results/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    // 失敗時でも画像を返す（404にしない）とX側で表示が安定
    return new ImageResponse(
      <div style={{ width: size.width, height: size.height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', fontSize: 48 }}>
        Result Not Found
      </div>,
      size
    );
  }
  const data = await res.json(); // { equity: [{t,e}], summary: {...} } を想定
  const points: number[] = (data.equity ?? []).slice(-200).map((p: any) => Number(p.e));
  const min = Math.min(...points, 0), max = Math.max(...points, 1);
  const toXY = (v: number, i: number) => {
    const x = Math.round((i / Math.max(points.length - 1, 1)) * 1100) + 50;
    const y = Math.round(580 - ((v - min) / Math.max(max - min || 1, 1)) * 300);
    return `${x},${y}`;
  };
  const polyline = points.map(toXY).join(' ');
  const pnl = (points.at(-1) ?? 0) - (points[0] ?? 0);
  const pnlPct = points[0] ? (pnl / points[0]) * 100 : 0;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: '#0b0b0c', color: 'white', padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui' }}>
        <div style={{ fontSize: 44, fontWeight: 700 }}>Delver • Backtest Result</div>
        <div style={{ fontSize: 24, opacity: 0.8, marginTop: 6 }}>#{id.slice(0,8)} • PnL {pnl.toFixed(0)} ({pnlPct.toFixed(1)}%)</div>
        <svg width="1120" height="420" viewBox="0 0 1120 420" style={{ marginTop: 24, borderRadius: 16, background: '#111' }}>
          <line x1="50" y1="380" x2="1150" y2="380" stroke="#333" />
          <line x1="50" y1="80"  x2="1150" y2="80"  stroke="#333" />
          <polyline points={polyline} fill="none" stroke="#22c55e" strokeWidth="4" />
        </svg>
        <div style={{ marginTop: 16, fontSize: 18, opacity: 0.8 }}>delvertrade.com</div>
      </div>
    ),
    size
  );
}