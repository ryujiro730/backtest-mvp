// app/[locale]/tools/risk-of-ruin/BalsaraClient.tsx
"use client";
import { useState, useMemo, useEffect, useRef } from "react";
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
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
<p className="text-sm text-zinc-500">
  {t.rich("description", {
    // 1. JSON内の {ruinFrac} に相当する部分を、関数として定義する
    ruinFrac: (chunks) => (
      <span className="font-mono">
        {Math.round(ruinFrac * 100)}%
      </span>
    ),
  })}
</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("cards.inputs")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field 
            label={t("fields.winRate")} 
            value={p} onCommit={setP} mode="prob" min={0.01} max={0.99} step={0.01} 
            hint={t("fields.probHint")}
          />
          <Field 
            label={t("fields.rr")} 
            value={rr} onCommit={setRR} mode="float" min={0.1} max={10} step={0.1} 
          />
          <Field 
            label={t("fields.riskRate")} 
            value={f} onCommit={setF} mode="percent" min={0.5} max={20} step={0.5} 
          />
          <Field 
            label={t("fields.trials")} 
            value={n} onCommit={(v) => setN(Math.round(v))} mode="int" min={10} max={5000} step={10} 
          />
          <div className="md:col-span-2">
            <Field 
              label={t("fields.ruinLimit")} 
              value={ruinFrac} onCommit={setRuinFrac} mode="percent" min={5} max={80} step={5} 
            />
          </div>
        </CardContent>
      </Card>

      <CurrentRorCard
        ror={result.ror}
        kelly={result.kelly}
        ruinFrac={ruinFrac}
        f={f}
        p={p}
        rr={rr}
        n={n}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("cards.chart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RuinChart p={p} rr={rr} n={n} ruinFrac={ruinFrac} f={f} fMaxPct={30} height={300} />
        </CardContent>
      </Card>
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
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        />
      </div>
      {hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={tone}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("cards.currentRor")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{rorPct}%</div>
          <p className="mt-1 text-xs text-zinc-500">
            {t("result.limitLabel", { val: Math.round(ruinFrac * 100) })}
          </p>
          <p className="mt-3 text-sm font-semibold">{verdict}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("cards.inputs")}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between"><span>{t("fields.winRate")}</span><span className="font-mono">{p}</span></div>
          <div className="flex justify-between"><span>{t("fields.rr")}</span><span className="font-mono">{rr}</span></div>
          <div className="flex justify-between"><span>{t("fields.riskRate")}</span><span className="font-mono">{(f*100).toFixed(1)}%</span></div>
          <div className="flex justify-between"><span>{t("fields.trials")}</span><span className="font-mono">{n}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t("cards.reference")}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="font-medium">{t("result.kelly")} <span className="font-mono">{kellyPct}%</span></div>
          <p className="mt-4 text-[10px] text-zinc-500 leading-tight">
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