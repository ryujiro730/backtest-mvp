// app/PageClient.tsx  ← Client Component
'use client';

import {useState} from 'react';
import Link from 'next/link';
import Newsletter from './(public)/components/Newsletter';
//import PricingCtaClient from './PricingCtaClient';
import Header from '@/components/layout/Header';
import Image from "next/image";
import HeaderAuthButtons from '@/components/button/HeaderAuthButtons';
import { flags } from '@/lib/flags';

function Kbd({children}:{children:React.ReactNode}) {
  return <span className="kbd">{children}</span>;
}
function Check({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
      {children}
    </div>
  );
}

export default function PageClient() {

  return (
    <main className="relative isolate pt-14">{/* ← 追記：ヘッダー高さぶん余白 */}
      <Header variant="dark" transparent />

{/* ===== Hero ===== */}
<section className="relative overflow-hidden">
  <div aria-hidden className="pointer-events-none absolute inset-0 hero-gradient -z-10" />

  <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-16 md:py-28 lg:py-32">
    <div className="mx-auto max-w-3xl text-center space-y-6 md:space-y-8">
      {/* badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
        <span>Beta</span>
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
        <span>FX Backtest</span>
      </div>

      {/* H1 */}
      <div className="relative h-[clamp(44px,8vw,92px)]">
        <h1
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     w-fit font-black tracking-[-0.01em] text-white
                     text-[clamp(28px,6vw,64px)] leading-tight
                     whitespace-nowrap break-keep"
        >
          <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            負ける戦略で資金を溶かさない
          </span>
        </h1>
      </div>

      {/* subtitle */}
      <p className="mx-auto max-w-3xl text-zinc-300 text-base sm:text-lg md:text-xl leading-8 md:leading-9 break-keep">
        FXトレーダー、暗号資産トレーダーのための完全無料シミュレーションツール。
      </p>

      {/* CTA */}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="app" className="btn w-full justify-center sm:w-auto">
          まずは1戦略を審査する
        </a>
      </div>

      <p className="text-sm text-white/60">
        画面は開発中のモックです。実際のUIは異なる場合があります。現在はMVP版をご利用いただけます。
      </p>
    </div>

    {/* mock screenshot */}
    <div className="mx-auto mt-16 md:mt-24 w-full max-w-5xl">
      <div className="card relative overflow-hidden">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpHeroPhoto.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt="Performance dashboard preview"
        />
      </div>
    </div>
  </div>
</section>

{/* ===== Section: Define entry Conditions ===== */}
<section className="py-16 md:py-24 w-full px-4 sm:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center
                  gap-y-10 md:gap-y-12 gap-x-12 md:gap-x-16">
    <div className="space-y-4 md:space-y-6">
      <h3 className="font-semibold leading-tight break-words
                     text-[clamp(24px,5vw,48px)]">
        Define entry Conditions
      </h3>
      <p className="text-zinc-300 leading-snug
                    text-[clamp(14px,1.6vw,20px)]">
        エントリールールは資金管理から複数インジケータまで網羅
      </p>
    </div>

    <div className="mt-8 md:mt-0 flex justify-center">
      <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpSettingsPhoto.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt=""
        />
      </div>
    </div>
  </div>
</section>

{/* ===== Section: TimeZone ===== */}
<section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
    <div className="order-1 md:order-1 space-y-4 md:space-y-6">
      <h3 className="font-semibold leading-tight
                     text-[clamp(24px,5vw,48px)]">
        Time Zone
      </h3>
      <p className="text-zinc-300 leading-snug
                    text-[clamp(14px,1.6vw,20px)]">
        あらゆるタイムゾーン、曜日で厳密にバックテストを実行し最適なタイミングを抽出
      </p>
    </div>

    <div className="order-2 md:order-2 flex justify-center">
      <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpSettingsPhoto2.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt=""
        />
      </div>
    </div>
  </div>
</section>

{/* ===== Indicator ===== */}
<section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
    <div className="space-y-4 md:space-y-6">
      <h3 className="font-semibold leading-tight
                     text-[clamp(24px,5vw,48px)]">
        Indicator Threshold
      </h3>
      <p className="text-zinc-300 leading-snug
                    text-[clamp(14px,1.6vw,20px)]">
        複数のインジケータを組み合わせ、閾値を細かく設定しあらゆる市場状況に対応
      </p>
    </div>

    <div className="flex justify-center">
      <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpSettingsPhoto4.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt=""
        />
      </div>
    </div>
  </div>
</section>

{/* ===== PriceAction ===== */}
<section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
    <div className="space-y-4 md:space-y-6">
      <h3 className="font-semibold leading-tight
                     text-[clamp(24px,5vw,48px)]">
        Price Action
      </h3>
      <p className="text-zinc-300 leading-snug
                    text-[clamp(14px,1.6vw,20px)]">
        既存のバックテストでは難しいプライスアクションでの自動バックテストを可能に
      </p>
    </div>

    <div className="flex justify-center">
      <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpSettingsPhoto5.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt=""
        />
      </div>
    </div>
  </div>
</section>

{/* ===== ChartPattern ===== */}
<section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
    <div className="space-y-4 md:space-y-6">
      <h3 className="font-semibold leading-tight
                     text-[clamp(24px,5vw,48px)]">
        Chart Pattern
      </h3>
      <p className="text-zinc-300 leading-snug
                    text-[clamp(14px,1.6vw,20px)]">
        人間の目では認識が難しいチャートパターンもキャッチしあらゆる状況に対応する条件設定
      </p>
    </div>

    <div className="flex justify-center">
      <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpSettingsPhoto6.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt=""
        />
      </div>
    </div>
  </div>
</section>

{/* ===== Exit ===== */}
<section className="mt-10 w-full px-4 sm:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 items-center gap-[clamp(16px,3vw,40px)]">
    <div className="space-y-4 md:space-y-6">
      <h3 className="font-semibold leading-tight
                     text-[clamp(24px,5vw,48px)]">
        Exit
      </h3>
      <p className="text-zinc-300 leading-snug
                    text-[clamp(14px,1.6vw,20px)]">
        業界最大級のエグジットパターンを用い、信頼性の高いバックテストで検証
      </p>
    </div>

    <div className="flex justify-center">
      <div className="card relative overflow-hidden w-full max-w-[min(720px,90vw)]">
        <div aria-hidden className="absolute -inset-20 glow" />
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black" />
        <Image
          src={`${process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'https://api.delvertrade.com'}/public-uploads/photo/LpSettingsPhoto3.png`}
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl border border-white/10"
          alt=""
        />
      </div>
    </div>
  </div>
</section>


      {/* ===== Features ===== */}
      <section id="features" className="section">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="h2">Why Delver</h2>
          <div className="mt-8 grid gap-[clamp(12px,2vw,24px)] sm:grid-cols-2 md:grid-cols-3">
            <div className="card">
              <div className="text-sm text-zinc-400">爆速実行</div>
              <p className="mt-2 text-zinc-300">
                軽量ワーカーとキューでタスクを分散。待ち時間を最小化。
              </p>
            </div>
            <div className="card">
              <div className="text-sm text-zinc-400">並列バックテスト</div>
              <p className="mt-2 text-zinc-300">
                複数パラメータを同時に実行、比較と学習を一気に。
              </p>
            </div>
            <div className="card ring-1 ring-brand-500/30">
              <div className="text-sm text-zinc-400">完全無料</div>
              <p className="mt-2 text-zinc-300">
                当サイトのいかなるサービスを利用したとしても一切の料金は発生しません。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="section">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="h2">使い方（90秒）</h2>
          <div className="mt-6 space-y-[clamp(8px,1.5vw,16px)]">
            <Check>
              <p>「まずは1戦略を審査する」へ 移動</p>
            </Check>
            <Check>
              <p>条件を入力して <Kbd>Run</Kbd> で実行</p>
            </Check>
            <Check>
              <p>結果を共有</p>
            </Check>
          </div>
        </div>
      </section>

{!flags.freeMode && (
  /* ===== Pricing teaser ===== */
  <section id="pricing" className="section">
    <div className="container mx-auto max-w-6xl px-4 sm:px-6">
      <h2 className="h2">料金プラン</h2>
      <div className="mt-8 grid gap-[clamp(12px,2vw,24px)] sm:grid-cols-2 md:grid-cols-3">
        {/* Free */}
        <div className="card">
          <div className="text-sm text-zinc-400">Free</div>
          <div className="mt-2 text-3xl font-extrabold">$0/月</div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>基本的なバックテスト</li>
            <li>結果グラフの閲覧</li>
            <li>制限付き実行回数</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="card ring-1 ring-brand-500/40">
          <div className="text-sm text-zinc-400">Starter</div>
          <div className="mt-2 text-3xl font-extrabold">$20/月</div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>高速キュー</li>
            <li>1日あたり30回まで実行可能</li>
            <li>優先サポート</li>
          </ul>
          <PricingCtaClient />
        </div>

        {/* Elite */}
        <div className="card">
          <div className="text-sm text-zinc-400">Pro</div>
          <div className="mt-2 text-3xl font-extrabold">$35/月</div>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>大規模並列・専用リソース</li>
            <li>実行回数 無制限</li>
            <li>専任サポート</li>
          </ul>
          <PricingCtaClient />
        </div>
      </div>
    </div>
  </section>
)}

      {/* ===== Footer ===== */}
      <footer className="section pt-10">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-[clamp(12px,2vw,20px)] md:grid-cols-3">
            <div>
              <div className="font-bold">
                Delver: 完全無料のFXと暗号資産トレードバックテスト & 資産運用シミュレーション
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                検証から学習まで、戦略づくりを最速に。
              </p>
            </div>
            <nav className="space-y-2 text-sm text-zinc-400">
              <Link href="/blog" className="block hover:text-zinc-200">Blog</Link>
              <Link href="/contact" className="block hover:text-zinc-200">Contact Us</Link>
              <Link href="/terms" className="block hover:text-zinc-200">利用規約</Link>
            </nav>
            <div>
              <div className="text-sm text-zinc-400">
                最新情報をメールで受け取る
              </div>
              <Newsletter />
            </div>
          </div>
          <div className="mt-10 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
            © {new Date().getFullYear()} Delver: 完全無料のFXと暗号資産トレードバックテスト & 資産運用シミュレーション
          </div>
        </div>
      </footer>
    </main>
  );
}