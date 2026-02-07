import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FX 期待値（EV）判定ツール｜Delver Tools",
  description:
    "勝率・RR・リスク率・手数料・スリッページから、1トレードあたりの期待値（EV）を即時計算。数学的に有利か不利かを明確に判定。",
  alternates: { canonical: "/tools/ev-check" },
  openGraph: {
    title: "期待値（EV）判定ツール",
    description:
      "そのトレードは本当にプラス期待値？コスト込みでEVを即判定。",
    images: ["/og/tools-ev-check.png"],
  },
};
