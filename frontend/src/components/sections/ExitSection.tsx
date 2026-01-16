// src/rules/sections/ExitSection.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/* =========================================================
   Exit Section Logic & Updaters
   ========================================================= */

import { nanoid } from "nanoid";
import { useRuleStore } from "@/rules/store";

export function useExitHandlers() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);

  const exit = rule.exit;

  /* ------------------------------
   Logic toggle (AND / OR)
  ------------------------------- */
  const toggleLogic = (v: boolean) =>
    update({
      exit: {
        ...exit,
        logic: v ? "AND" : "OR",
      },
    });

  /* ------------------------------
    TP / SL (pips)
  ------------------------------- */
  const setTpPips = (v: number | null) =>
    update({
      exit: {
        ...exit,
        tpPips: v,
      },
    });

  const setSlPips = (v: number | null) =>
    update({
      exit: {
        ...exit,
        slPips: v,
      },
    });

  /* ------------------------------
    Candle Pattern Exit (rules[])
  ------------------------------- */

  const updateCandleRules = (next: any[]) =>
    update({
      exit: {
        ...exit,
        candleRules: next,
      },
    });

  const addCandleRule = () =>
    updateCandleRules([
      ...exit.candleRules,
      {
        id: nanoid(),
        key: "pinbar", // 初期値
        params: {
          signal: "bullish",
          entrySide: "long",
        },
      },
    ]);

  const updateCandleRuleItem = (id: string, patch: any) =>
    updateCandleRules(
      exit.candleRules.map((r: any) =>
        r.id === id ? { ...r, ...patch } : r
      )
    );

  const removeCandleRule = (id: string) =>
    updateCandleRules(exit.candleRules.filter((r) => r.id !== id));

  /* ------------------------------
    Equity Percentage TP/SL (%)
  ------------------------------- */

  const setTpPct = (v: number | null) =>
    update({
      exit: {
        ...exit,
        tpPct: v,
      },
    });

  const setSlPct = (v: number | null) =>
    update({
      exit: {
        ...exit,
        slPct: v,
      },
    });

  /* ------------------------------
    Time Limits (minutes)
  ------------------------------- */

  const setTpTimeMin = (v: number | null) =>
    update({
      exit: {
        ...exit,
        tpTimeMin: v,
      },
    });

  const setSlTimeMin = (v: number | null) =>
    update({
      exit: {
        ...exit,
        slTimeMin: v,
      },
    });

  /* ------------------------------
    Forced Exit Time (start/end)
  ------------------------------- */

  const setForcedExitStart = (time: string | null) =>
    update({
      exit: {
        ...exit,
        forcedExit: {
          ...exit.forcedExit,
          start: time,
        },
      },
    });

  const setForcedExitEnd = (time: string | null) =>
    update({
      exit: {
        ...exit,
        forcedExit: {
          ...exit.forcedExit,
          end: time,
        },
      },
    });

  /* ------------------------------
    Trailing Stop (pips)
  ------------------------------- */

  const setTrailingActivate = (v: number | null) =>
    update({
      exit: {
        ...exit,
        trailing: {
          ...exit.trailing,
          activate: v,
        },
      },
    });

  const setTrailingTrail = (v: number | null) =>
    update({
      exit: {
        ...exit,
        trailing: {
          ...exit.trailing,
          trail: v,
        },
      },
    });

  /* ------------------------------
    Default params for candle rules
  ------------------------------- */

  const defaultCandleParams = (key: string) => {
    switch (key) {
      case "pinbar":
        return { signal: "bullish", entrySide: "long" };
      case "engulfing":
        return { signal: "bullish", entrySide: "long" };
      case "inside":
        return { signal: "bullish", entrySide: "long" };
      default:
        return { signal: "bullish", entrySide: "long" };
    }
  };

  /* ------------------------------
    Display name (UI)
  ------------------------------- */

  const candleDisplayName = (key: string) => {
    switch (key) {
      case "pinbar":
        return "ピンバー";
      case "engulfing":
        return "包み足";
      case "inside":
        return "インサイドバー";
      default:
        return key;
    }
  };

  return {
    exit,

    // logic
    toggleLogic,

    // TP/SL
    setTpPips,
    setSlPips,

    // candle rules
    addCandleRule,
    updateCandleRuleItem,
    removeCandleRule,
    defaultCandleParams,
    candleDisplayName,

    // pct TP/SL
    setTpPct,
    setSlPct,

    // time limits
    setTpTimeMin,
    setSlTimeMin,

    // forced exit
    setForcedExitStart,
    setForcedExitEnd,

    // trailing
    setTrailingActivate,
    setTrailingTrail,
  };
}



export function ExitSection() {
  const {
  exit,
  toggleLogic,
  setTpPips,
  setSlPips,
  addCandleRule,
  updateCandleRuleItem,
  removeCandleRule,
  defaultCandleParams,
  candleDisplayName,
  setTpPct,
  setSlPct,
  setTpTimeMin,
  setSlTimeMin,
  setForcedExitStart,
  setForcedExitEnd,
  setTrailingActivate,
  setTrailingTrail,
} = useExitHandlers();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          エグジット条件
        </CardTitle>

        {/* AND / OR ロジック（後で Zustand 接続） */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">すべて満たす</span>
          <Switch
  checked={exit.logic === "AND"}
  onCheckedChange={(v) => toggleLogic(v)}
/>
          <span className="font-medium">AND</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* === TP / SL（pips） === */}
        <div className="grid grid-cols-2 gap-6">
          <LabeledInput label="テイクプロフィット（TP）" unit="pips" value={exit.tpPips ?? ""} onChange={(e) => setTpPips(Number(e.target.value))} />
          <LabeledInput label="ストップロス（SL）" unit="pips" value={exit.slPips ?? ""} onChange={(e) => setSlPips(Number(e.target.value))} />
        </div>

        {/* === ローソク足反転エグジット === */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ローソク足反転によるエグジット
            </label>
            <Select
  value={exit.candleRules[0]?.key ?? ""}
  onValueChange={(v) => {
    if (exit.candleRules.length === 0) addCandleRule();
    updateCandleRuleItem(exit.candleRules[0].id, {
      key: v,
      params: defaultCandleParams(v),
    });
  }}
>

              <SelectTrigger>
                <SelectValue placeholder="選択なし" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pinbar">ピンバー</SelectItem>
                <SelectItem value="engulfing">包み足</SelectItem>
                <SelectItem value="inside">インサイドバー</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* === 証拠金比率 === */}
        <div className="grid grid-cols-2 gap-6">
<LabeledInput
  label="利益確定（証拠金比率）"
  unit="%"
  value={exit.tpPct ?? ""}
  onChange={(e) => setTpPct(Number(e.target.value))}
/>

<LabeledInput
  label="損切り（証拠金比率）"
  unit="%"
  value={exit.slPct ?? ""}
  onChange={(e) => setSlPct(Number(e.target.value))}
/>

        </div>

        {/* === 保有時間 === */}
        <div className="grid grid-cols-2 gap-6">
<LabeledInput
  label="最大保有時間（利益確定）"
  unit="分"
  value={exit.tpTimeMin ?? ""}
  onChange={(e) => setTpTimeMin(Number(e.target.value))}
/>

<LabeledInput
  label="最大保有時間（損切り）"
  unit="分"
  value={exit.slTimeMin ?? ""}
  onChange={(e) => setSlTimeMin(Number(e.target.value))}
/>

        </div>

        {/* === 強制エグジット時間帯 === */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              強制エグジット時間（開始）
            </label>
            <Input
  type="time"
  value={exit.forcedExit.start ?? ""}
  onChange={(e) => setForcedExitStart(e.target.value)}
/>

          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              強制エグジット時間（終了）
            </label>
            <Input
  type="time"
  value={exit.forcedExit.end ?? ""}
  onChange={(e) => setForcedExitEnd(e.target.value)}
/>
          </div>
        </div>

        {/* === トレーリングストップ === */}
        <div className="pt-6 border-t space-y-4">
          <h3 className="text-sm font-semibold">トレーリングストップ</h3>

          <div className="grid grid-cols-2 gap-6">
            <LabeledInput
  label="開始利益"
  unit="pips"
  value={exit.trailing.activate ?? ""}
  onChange={(e) => setTrailingActivate(Number(e.target.value))}
 />

            <LabeledInput
  label="トレール幅"
  unit="pips"
  value={exit.trailing.trail ?? ""}
  onChange={(e) => setTrailingTrail(Number(e.target.value))}
 />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ======================
   共通 Input（単位付き）
====================== */

function LabeledInput({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          className="pr-14"
          value={value ?? ""}
          onChange={onChange}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}
