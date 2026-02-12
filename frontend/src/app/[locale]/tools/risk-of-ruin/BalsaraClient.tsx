// app/[locale]/tools/risk-of-ruin/BalsaraClient.tsx
"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { riskOfRuinRunApprox, kellyFraction } from "@/lib/math/balsara";
import RuinChart from "@/app/[locale]/tools/risk-of-ruin/RuinChart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

const RELATED_ARTICLES = [
  { slug: "max-drawdown-risk-of-ruin", image: "/blog/max-drawdown-risk-of-ruin/dd_vs_recovery.png", titleKey: "related.articleMaxDrawdown" as const },
  { slug: "how-to-read-backtest-results", image: "/blog/how-to-read-backtest-results/delver_results.png", titleKey: "related.articleHowToRead" as const },
  { slug: "winrate-pf-overfitting-trap", image: "/blog/winrate-pf-overfitting-trap/high_pf_curve_fitting.png", titleKey: "related.articleWinratePf" as const },
];

export default function BalsaraClient() {
  const t = useTranslations("Balsara");
  const [p, setP] = useState(0.5);
  const [rr, setRR] = useState(1.0);
  const [f, setF] = useState(0.02);
  const [n, setN] = useState(200);
  const [ruinFrac, setRuinFrac] = useState(0.2);

  const result = useMemo(() => ({
    ror: riskOfRuinRunApprox({ p, rr, f, n, ruinFrac }),
    kelly: kellyFraction({ p, rr }),
  }), [p, rr, f, n, ruinFrac]);

  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-12 md:px-16 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,180px)_1fr_minmax(0,180px)] gap-6 md:gap-8 items-start">
        {/* PC左: チャートCTA */}
        <aside className="hidden md:block sticky top-24">
          <Link
            href="/chart"
            className="flex flex-col gap-2 rounded-xl bg-white p-4 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <span className="text-sm font-medium text-slate-800">{t("related.sidebarChart")}</span>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </Link>
        </aside>

        {/* 中央: バルサラ本体 — 外側ゆったり・中は少し詰める */}
        <div className="min-w-0 space-y-6">
          <header className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t.rich("description", {
                ruinFrac: (chunks) => (
                  <span className="font-mono">{Math.round(ruinFrac * 100)}%</span>
                ),
              })}
            </p>
          </header>

          <Card className="border-0 bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 tracking-tight">{t("cards.inputs")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={t("fields.winRate")} value={p} onCommit={setP} mode="prob" min={0.01} max={0.99} step={0.01} hint={t("fields.probHint")} />
              <Field label={t("fields.rr")} value={rr} onCommit={setRR} mode="float" min={0.1} max={10} step={0.1} />
              <Field label={t("fields.riskRate")} value={f} onCommit={setF} mode="percent" min={0.5} max={20} step={0.5} />
              <Field label={t("fields.trials")} value={n} onCommit={(v) => setN(Math.round(v))} mode="int" min={10} max={5000} step={10} />
              <div className="md:col-span-2">
                <Field label={t("fields.ruinLimit")} value={ruinFrac} onCommit={setRuinFrac} mode="percent" min={5} max={80} step={5} />
              </div>
            </CardContent>
          </Card>

          <CurrentRorCard ror={result.ror} kelly={result.kelly} ruinFrac={ruinFrac} f={f} p={p} rr={rr} n={n} />

          <Card className="border-0 bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800 tracking-tight">{t("cards.chart")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RuinChart p={p} rr={rr} n={n} ruinFrac={ruinFrac} f={f} fMaxPct={30} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* PC右: バックテストCTA + 関連記事 */}
        <aside className="hidden md:flex flex-col gap-4 sticky top-24">
          <Link
            href="/app"
            className="flex flex-col gap-2 rounded-xl bg-blue-600 p-4 text-white transition-all hover:bg-blue-700 hover:shadow-[0_8px_30px_rgba(37,99,235,0.35)]"
            style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.2)" }}
          >
            <span className="text-sm font-medium">{t("related.sidebarBacktest")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t("related.title")}</h3>
            <div className="space-y-3">
              {RELATED_ARTICLES.map(({ slug, image, titleKey }) => (
                <Link key={slug} href={`/blog/${slug}`} className="block rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div className="aspect-[16/10] relative bg-slate-100">
                    <Image src={image} alt="" fill className="object-cover" sizes="180px" />
                  </div>
                  <p className="p-2 text-xs font-medium text-slate-800 line-clamp-2">{t(titleKey)}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* スマホ: 画面下にCTA + 関連記事 */}
      <section className="md:hidden mt-12 pt-8 border-t border-slate-200/80 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chart"
            className="flex items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm font-medium text-slate-800 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            {t("related.sidebarChart")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/app"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-shadow hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)]"
            style={{ boxShadow: "0 2px 12px rgba(37,99,235,0.2)" }}
          >
            {t("related.sidebarBacktest")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">{t("related.title")}</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {RELATED_ARTICLES.map(({ slug, image, titleKey }) => (
              <Link key={slug} href={`/blog/${slug}`} className="flex-shrink-0 w-[200px] rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="aspect-[16/10] relative bg-slate-100">
                  <Image src={image} alt="" fill className="object-cover" sizes="200px" />
                </div>
                <p className="p-2 text-xs font-medium text-slate-800 line-clamp-2">{t(titleKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label, value, onCommit, mode, min, max, step, placeholder, hint
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
  mode: "percent" | "float" | "int" | "prob";
  min: number;
  max: number;
  step: number;
  placeholder?: string;
  hint?: string;
}) {
  const [text, setText] = useState<string>(() => formatDisplay(value, mode));
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setText(formatDisplay(value, mode)); }, [value, mode]);

  const commit = (raw: string) => {
    const s = raw.trim().replace(/％/g, "%");
    if (s === "") { setText(formatDisplay(value, mode)); return; }
    const hasPct = s.endsWith("%");
    const num = Number(hasPct ? s.slice(0, -1) : s);
    if (Number.isNaN(num)) { setText(formatDisplay(value, mode)); return; }

    const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

    if (mode === "int") {
      const v = clamp(Math.round(num), min, max);
      onCommit(v);
      setText(String(v));
    } else if (mode === "percent") {
      const vPct = clamp(num, min, max);
      onCommit(vPct / 100);
      setText(String(vPct));
    } else if (mode === "prob") {
      const asProb = hasPct || num > 1 ? num / 100 : num;
      const v = clamp(asProb, 0.01, 0.99);
      onCommit(v);
      setText(trimFloat(v));
    } else {
      const v = clamp(num, min, max);
      onCommit(v);
      setText(trimFloat(v));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="flex h-10 w-full rounded-lg bg-slate-100/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 border border-transparent"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        />
      </div>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function CurrentRorCard({
  ror, kelly, ruinFrac, f, p, rr, n,
}: {
  ror: number; kelly: number; ruinFrac: number; f: number; p: number; rr: number; n: number;
}) {
  const t = useTranslations("Balsara");
  const rorPct = Math.round(ror * 1000) / 10;
  const kellyPct = Math.round(kelly * 1000) / 10;

  const tone = cn(
    "border-2",
    rorPct >= 50 && "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10",
    rorPct >= 10 && rorPct < 50 && "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10",
    rorPct < 10 && "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10"
  );

  const verdict = rorPct >= 50 ? t("result.verdicts.danger") : rorPct >= 10 ? t("result.verdicts.warning") : t("result.verdicts.safe");

  const cardBase = "border-0 bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]";
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={cn(cardBase, tone)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{t("cards.currentRor")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-slate-900">{rorPct}%</div>
          <p className="mt-1 text-xs text-slate-500">
            {t("result.limitLabel", { val: Math.round(ruinFrac * 100) })}
          </p>
          <p className="mt-3 text-sm font-semibold">{verdict}</p>
        </CardContent>
      </Card>

      <Card className={cardBase}>
        <CardHeader className="pb-2">
          <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{t("cards.inputs")}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-slate-600">
          <div className="flex justify-between"><span>{t("fields.winRate")}</span><span className="font-mono text-slate-900">{p}</span></div>
          <div className="flex justify-between"><span>{t("fields.rr")}</span><span className="font-mono text-slate-900">{rr}</span></div>
          <div className="flex justify-between"><span>{t("fields.riskRate")}</span><span className="font-mono text-slate-900">{(f*100).toFixed(1)}%</span></div>
          <div className="flex justify-between"><span>{t("fields.trials")}</span><span className="font-mono text-slate-900">{n}</span></div>
        </CardContent>
      </Card>

      <Card className={cardBase}>
        <CardHeader className="pb-2">
          <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{t("cards.reference")}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="font-medium text-slate-800">{t("result.kelly")} <span className="font-mono">{kellyPct}%</span></div>
          <p className="mt-4 text-[10px] text-slate-400 leading-tight">
            {t("result.disclaimer")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDisplay(v: number, mode: "percent" | "float" | "int" | "prob") {
  if (mode === "percent") return trimFloat(v * 100);
  if (mode === "int")     return String(Math.round(v));
  return trimFloat(v);
}
function trimFloat(x: number, digits = 6) { return String(Number(x.toFixed(digits))); }