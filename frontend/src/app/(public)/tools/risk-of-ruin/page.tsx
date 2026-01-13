"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { riskOfRuinRunApprox, kellyFraction } from "@/lib/math/balsara";
import RuinChart from "@/app/(public)/components/RuinChart";

export default function Page() {
  const [p, setP]   = useState(0.5);    // 勝率 (0..1)
  const [rr, setRR] = useState(1.0);    // RR
  const [f, setF]   = useState(0.02);   // リスク率 (0..1)
  const [n, setN]   = useState(200);    // 試行回数
  const [ruinFrac, setRuinFrac] = useState(0.2); // 破産基準 (0..1)

  const result = useMemo(() => ({
    ror: riskOfRuinRunApprox({ p, rr, f, n, ruinFrac }),
    kelly: kellyFraction({ p, rr }),
  }), [p, rr, f, n, ruinFrac]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">バルサラの破産確率シミュレーター</h1>
        <p className="text-sm text-gray-500">
          勝率・RR・リスク率・試行回数から破産確率を推定します（クライアント計算）。ここでの「破産」は
          <span className="font-mono"> {Math.round(ruinFrac*100)}% </span>未満に資金が落ちることを指します。
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 勝率は小数（0.55など）で直接入力 */}
        <Field
          label="勝率 p"
          value={p}
          onCommit={setP}
          mode="prob"
          min={0.01}
          max={0.99}
          step={0.01}
          placeholder="0.55"
        />

        <Field
          label="RR（勝ち:負け）"
          value={rr}
          onCommit={setRR}
          mode="float"
          min={0.1}
          max={10}
          step={0.1}
          placeholder="1.0"
        />

        {/* % 入力（表示は 0..100, 内部 0..1） */}
        <Field
          label="リスク率 f（%）"
          value={f}
          onCommit={setF}
          mode="percent"
          min={0.5}   // 単位は%（UI基準）
          max={20}
          step={0.5}
          placeholder="2"
        />

        <Field
          label="試行回数 N"
          value={n}
          onCommit={(v)=>setN(Math.round(v))}
          mode="int"
          min={10}
          max={5000}
          step={10}
          placeholder="200"
        />

        <Field
          label="破産基準（初期資金の%）"
          value={ruinFrac}
          onCommit={setRuinFrac}
          mode="percent"
          min={5}
          max={80}
          step={5}
          placeholder="20"
        />
      </section>

        {/* ▼ ここに追加：現在の破産確率カード */}
      <CurrentRorCard
        ror={result.ror}
        kelly={result.kelly}
        ruinFrac={ruinFrac}
        f={f}
        p={p}
        rr={rr}
        n={n}
      />

      <RuinChart p={p} rr={rr} n={n} ruinFrac={ruinFrac} f={f} fMaxPct={30} height={300} />

    </div>
  );
}

/** 汎用入力フィールド
 * - mode="percent" : 表示は %（0..100）。内部は 0..1 を onCommit へ。
 * - mode="float"   : 小数。内部そのまま。
 * - mode="int"     : 整数。内部そのまま（onCommit 側で丸めてもOK）。
 * 入力中は文字列を保持し、blur時にのみ丸め/Clampして確定。
 */
// 変更点: mode に "prob" を追加
function Field({
  label, value, onCommit, mode, min, max, step, placeholder,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
  mode: "percent" | "float" | "int" | "prob"; // ← 追加
  min: number;
  max: number;
  step: number;
  placeholder?: string;
}) {
  const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
  const [text, setText] = useState<string>(() => formatDisplay(value, mode));
  const [composing, setComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setText(formatDisplay(value, mode)); }, [value, mode]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { if (document.activeElement === el) e.preventDefault(); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const commit = (raw: string) => {
    const s = raw.trim().replace(/％/g, "%");
    if (s === "") { setText(formatDisplay(value, mode)); return; }

    // 数値抽出（末尾%は許容）
    const hasPct = s.endsWith("%");
    const num = Number(hasPct ? s.slice(0, -1) : s);
    if (Number.isNaN(num)) { setText(formatDisplay(value, mode)); return; }

    if (mode === "int") {
      const v = clamp(Math.round(num), min, max);
      onCommit(v);
      setText(String(v));
      return;
    }

    if (mode === "percent") {
      const vPct = clamp(num, min, max);
      onCommit(vPct / 100);
      setText(String(vPct));
      return;
    }

    if (mode === "prob") {
      // 0..1 か 0..100% のどちらでも受け付ける
      const asProb = hasPct || num > 1 ? num / 100 : num;
      const v = clamp(asProb, 0.01, 0.99); // 勝率の安全域
      onCommit(v);
      // 表示はユーザーに分かりやすいよう小数（0..1）で統一
      setText(trimFloat(v));
      return;
    }

    // float
    const v = clamp(num, min, max);
    onCommit(v);
    setText(trimFloat(v));
  };

  return (
    <label className="block">
      <div className="mb-1 text-sm text-gray-600">{label}</div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className="w-full rounded border px-3 py-2 bg-transparent"
          value={text}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            if (composing) return; // IME中は確定しない
          }}
          onBlur={() => commit(text)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={(e) => { setComposing(false); commit((e.target as HTMLInputElement).value); }}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        />
      </div>
      {mode === "prob" && (
        <div className="mt-1 text-xs text-gray-400">0〜1 または 0〜100%（例: 0.55 / 55%）</div>
      )}
    </label>
  );
}

function formatDisplay(v: number, mode: "percent" | "float" | "int" | "prob") {
  if (mode === "percent") return trimFloat(v * 100);
  if (mode === "int")     return String(Math.round(v));
  // prob/float は小数表示
  return trimFloat(v);
}
function trimFloat(x: number, digits = 6) { return String(Number(x.toFixed(digits))); }



function CurrentRorCard({
  ror, kelly, ruinFrac, f, p, rr, n,
}: {
  ror: number; kelly: number; ruinFrac: number; f: number; p: number; rr: number; n: number;
}) {
  const rorPct   = Math.round(ror * 1000) / 10;            // 0.1%刻み
  const kellyPct = Math.round(kelly * 1000) / 10;

  const tone =
    rorPct >= 50 ? 'text-red-400 border-red-400/30 bg-red-400/5'
  : rorPct >= 10 ? 'text-amber-400 border-amber-400/30 bg-amber-400/5'
                 : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* でかい数値カード */}
      <div className={`rounded-xl border p-4 ${tone}`}>
        <div className="text-sm opacity-75">現在の破産確率</div>
        <div className="mt-1 text-4xl font-semibold">{rorPct}%</div>
        <div className="mt-1 text-xs opacity-70">
          破産基準：初期の {Math.round(ruinFrac*100)}% 未満
        </div>
      </div>

      {/* 入力条件の要約 */}
      <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-300">
        <div className="opacity-80 mb-1">入力条件</div>
        <div className="grid grid-cols-2 gap-y-1">
          <div>勝率 p</div><div className="font-mono">{p}</div>
          <div>RR</div><div className="font-mono">{rr}</div>
          <div>リスク率 f</div><div className="font-mono">{(f*100).toFixed(1)}%</div>
          <div>試行回数 N</div><div className="font-mono">{n}</div>
        </div>
      </div>

      {/* 参考情報 */}
      <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-300">
        <div className="opacity-80 mb-1">参考</div>
        <div className="text-sm">Kelly：<span className="font-mono">{kellyPct}%</span></div>
        <p className="mt-2 text-xs text-gray-400">
          ※ 近似：連敗ベース・独立試行・固定f。教育目的の目安。
        </p>
      </div>
    </div>
  );
}



