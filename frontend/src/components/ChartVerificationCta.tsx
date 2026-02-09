"use client";

import Link from "next/link";
import { BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ctaBaseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] " +
  "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 " +
  "shadow-amber-500/25 hover:shadow-amber-400/40 " +
  "border border-amber-400/30 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2";

type ChartVerificationCtaProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** トップ用: 手動検証モードのメインCTA */
  variant?: "manual" | "fromRun";
};

/** チャートへルーティングするリッチCTA（Link） */
export function ChartVerificationCtaLink({
  href,
  children,
  className,
  variant = "fromRun",
}: ChartVerificationCtaProps) {
  const Icon = variant === "manual" ? Sparkles : BarChart3;
  return (
    <Link
      href={href}
      className={cn(ctaBaseClass, className)}
      aria-label={typeof children === "string" ? children : "チャートで検証"}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}

type ChartVerificationCtaButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

/** チャートへ遷移するリッチCTA（Button・Performance用） */
export function ChartVerificationCtaButton({
  onClick,
  children,
  className,
  disabled,
}: ChartVerificationCtaButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(ctaBaseClass, "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100", className)}
      aria-label={typeof children === "string" ? children : "チャートでエントリーを確認"}
    >
      <BarChart3 className="h-5 w-5 shrink-0" aria-hidden />
      {children}
    </button>
  );
}
