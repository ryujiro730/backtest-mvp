// frontend/src/app/app/layout.tsx
import { Metadata } from 'next'; // 👈 追加
import "./app.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export const metadata: Metadata = {
  title: "【無料】FXバックテスト検証ツール | ブラウザで爆速検証 Delver",
  description: "FXの過去検証（バックテスト）がブラウザ上で今すぐ無料で始められます。MT4不要、ゴールド(XAUUSD)対応。期待値や破産の確率も自動算出。効率的な検証で聖杯探しを卒業しましょう。",
  robots: {
    index: true,   // 👈 インデックスを許可
    follow: true,  // 👈 リンクのクロールを許可
  },
  // OGP設定（SNSでシェアされた時の見栄えも重要）
  openGraph: {
    title: "FXバックテスト検証ツール Delver",
    description: "ブラウザで完結する次世代のFX検証ツール",
    url: "https://delvertrade.com/ja/app", // 実際のURLに合わせて
    siteName: "Delver",
    locale: "ja_JP",
    type: "website",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="delver-app min-h-screen bg-gray-50 text-slate-900">{children}</div>;
}