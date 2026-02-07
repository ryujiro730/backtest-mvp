// src/app/tools/expected-value/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  expectancyR,
  breakevenWinrate,
  breakevenRR,
  clamp,
} from "@/lib/math/expectancy";
import { useTranslations } from "next-intl";



export default function Page() {
  const t = useTranslations("Balsara.EV");

  const [p, setP] = useState(0.5);
  const [rr, setRR] = useState(1.0);
  const [f, setF] = useState(0.02);
  const [feeBps, setFeeBps] = useState(5);
  const [slipBps, setSlipBps] = useState(1);

  const result = useMemo(() => {
    const pp = clamp(p, 0.01, 0.99);
    const rrr = clamp(rr, 0.1, 20);
    const ff = clamp(f, 0.001, 0.2);
    const fee = clamp(feeBps, 0, 200);
    const slip = clamp(slipBps, 0, 200);

    const { evR, costR } = expectancyR({
      p: pp,
      rr: rrr,
      riskFraction: ff,
      feeBpsRoundtrip: fee,
      slippageBpsRoundtrip: slip,
    });

    const evPct = evR * ff * 100;
    const pBe = breakevenWinrate({ rr: rrr, costR });
    const rrBe = breakevenRR({ p: pp, costR });

    return { pp, rrr, ff, fee, slip, evR, evPct, costR, pBe, rrBe };
  }, [p, rr, f, feeBps, slipBps]);

  const evR = result.evR;

function PercentInput({
  label,
  value,        // 内部値（0.74）
  setValue,
  placeholder,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState<string>(() =>
    Number.isFinite(value) ? String(Math.round(value * 100)) : ""
  );

  // 外部から value が変わったときだけ同期
  useEffect(() => {
    setText(Number.isFinite(value) ? String(Math.round(value * 100)) : "");
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);                 // ← 入力中はそのまま保持

            const n = Number(v);
            if (!Number.isNaN(n)) {
              setValue(n / 100);        // ← 計算用だけ更新
            }
          }}
          onBlur={() => {
            // フォーカス外れたときに正規化
            const n = Number(text);
            if (!Number.isNaN(n)) {
              setText(String(Math.round(n * 100) / 100));
            }
          }}
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  );
}


function NumberInput({
  label,
  value,
  setValue,
  placeholder,
  integer = false,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  placeholder?: string;
  integer?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={integer ? Math.round(value) : value}
        placeholder={placeholder}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n)) return;
          setValue(integer ? Math.round(n) : n);
        }}
      />
    </div>
  );
}


  const tone = cn(
    "border-2",
    evR < 0 && "border-red-200 bg-red-50",
    evR >= 0 && evR < 0.05 && "border-amber-200 bg-amber-50",
    evR >= 0.05 && "border-emerald-200 bg-emerald-50"
  );

  const verdict =
    evR < 0
      ? t("verdicts.negative")
      : evR < 0.05
        ? t("verdicts.border")
        : t("verdicts.positive");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

<Card>
  <CardHeader>
    <CardTitle>{t("cards.inputs")}</CardTitle>
  </CardHeader>

  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* 勝率 p */}
    <PercentInput
      label={t("labels.p")}
      value={p}
      setValue={setP}
      placeholder="55"
    />

    {/* RR */}
    <NumberInput
      label={t("labels.rr")}
      value={rr}
      setValue={setRR}
      placeholder="1.0"
    />

    {/* リスク率 f */}
    <PercentInput
      label={t("labels.f")}
      value={f}
      setValue={setF}
      placeholder="2"
    />

    {/* 手数料 bps */}
    <NumberInput
      label={t("labels.fee")}
      value={feeBps}
      setValue={setFeeBps}
      placeholder="5"
      integer
    />

    {/* スリッページ bps */}
    <NumberInput
      label={t("labels.slip")}
      value={slipBps}
      setValue={setSlipBps}
      placeholder="1"
      integer
    />
  </CardContent>
</Card>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={tone}>
          <CardHeader>
            <CardTitle>{t("cards.verdict")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-bold">{round(result.evR, 4)}R</div>
            <div className="text-sm text-muted-foreground">
              {t("result.evPct")}：{round(result.evPct, 4)}
              {t("result.perTrade")}
            </div>
            <div className="font-medium">{verdict}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cards.cost")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row k={t("result.costR")} v={`${round(result.costR, 4)}R`} />
            <Row k={t("result.fee")} v={`${result.fee}`} />
            <Row k={t("result.slip")} v={`${result.slip}`} />
            <Row
              k={t("result.risk")}
              v={`${round(result.ff * 100, 2)}%`}
            />
            <p className="pt-2 text-xs text-muted-foreground">
              {t("notes.cost")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("cards.breakeven")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row
              k={t("result.pBe")}
              v={`${round(result.pBe * 100, 2)}%`}
            />
            <Row
              k={t("result.rrBe")}
              v={`${round(result.rrBe, 3)}`}
            />
            <p className="pt-2 text-xs text-muted-foreground">
              {t("notes.breakeven")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("cards.howto")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <div>{t("notes.howto1")}</div>
          <div>{t("notes.howto2")}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}

function round(x: number, d = 4) {
  const p = Math.pow(10, d);
  return Math.round(x * p) / p;
}

function Num({
  label,
  value,
  setValue,
  mode,
  placeholder,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  mode: "prob" | "percent" | "float" | "int";
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={display(value, mode)}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          const v = parse(raw, mode);
          if (v == null) return;
          setValue(v);
        }}
      />
      {mode === "prob" && (
        <div className="text-xs text-muted-foreground">0.55 / 55%</div>
      )}
    </div>
  );
}

function display(v: number, mode: "prob" | "percent" | "float" | "int") {
  if (mode === "percent") return String(Math.round(v * 1000) / 10);
  if (mode === "int") return String(Math.round(v));
  return String(Math.round(v * 10000) / 10000);
}

function parse(raw: string, mode: "prob" | "percent" | "float" | "int") {
  const s = raw.trim().replace(/％/g, "%");
  if (!s) return null;

  const hasPct = s.endsWith("%");
  const num = Number(hasPct ? s.slice(0, -1) : s);
  if (Number.isNaN(num)) return null;

  if (mode === "int") return Math.round(num);
  if (mode === "percent") return num / 100;
  if (mode === "prob") return hasPct || num > 1 ? num / 100 : num;
  return num;
}
