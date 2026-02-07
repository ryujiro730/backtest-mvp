"use client";

import { useTranslations } from "next-intl";
import { Twitter } from "lucide-react";

type Props = {
  pf: number;
  /** 破産確率（%）。未計算の場合は null で「―」表示 */
  ruinPct?: number | null;
};

export function PerformanceXShareButton({ pf, ruinPct = null }: Props) {
  const t = useTranslations("Performance");

  const ruinStr = ruinPct != null ? `${ruinPct.toFixed(1)}%` : "―";
  const expectancyStr = pf === Infinity || Number.isNaN(pf) ? "―" : pf.toFixed(2);

  const tweetText =
    `#Delver で手法を検証しました。破産確率：${ruinStr}%、期待値：${expectancyStr}。 #FX過去検証`;

  const handleClick = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const text = encodeURIComponent(`${tweetText}\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300"
      aria-label={t("shareToX")}
    >
      <Twitter className="h-4 w-4" aria-hidden />
      {t("shareToX")}
    </button>
  );
}
