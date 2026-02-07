// src/components/sections/ExitSection.tsx
"use client";

import * as React from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitInput } from "@/components/common/UnitInput";
import { nanoid } from "nanoid";
import { useRuleStore } from "@/rules/store";
import type { ExitSideState, ExitState } from "@/rules/store";
import { useTranslations } from "next-intl";

/* =========================================================
   Exit Section Logic & Updaters（※一切変更なし）
   ========================================================= */

function getSideFromExit(exit: ExitState, side: "long" | "short"): ExitSideState {
  const base: ExitSideState = {
    tpPips: exit.tpPips,
    slPips: exit.slPips,
    tpPct: exit.tpPct,
    slPct: exit.slPct,
    tpTimeMin: exit.tpTimeMin,
    slTimeMin: exit.slTimeMin,
  };
  const s = side === "long" ? exit.long : exit.short;
  return s ? { ...base, ...s } : base;
}

export function useExitHandlers() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);
  const exit = rule.exit;

  const toggleLogic = (v: boolean) =>
    update((rule) => ({
      exit: { ...rule.exit, logic: v ? "AND" : "OR" },
    }));

  const setTpPips = (v: number | null) =>
    update((rule) => ({ exit: { ...rule.exit, tpPips: v } }));

  const setSlPips = (v: number | null) =>
    update((rule) => ({ exit: { ...rule.exit, slPips: v } }));

  const getSide = (side: "long" | "short"): ExitSideState =>
    getSideFromExit(exit, side);

  const setSide = (side: "long" | "short", patch: Partial<ExitSideState>) =>
    update((rule) => {
      const prev = rule.exit;
      const sideState = getSideFromExit(prev, side);
      return {
        exit: {
          ...prev,
          [side]: { ...sideState, ...patch },
        },
      };
    });

  const addCandleRule = () =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        candleRules: [
          ...rule.exit.candleRules,
          {
            id: nanoid(),
            type: "exit" as const,
            key: "pinbar",
            params: { signal: "bullish", entrySide: "long" },
          },
        ],
      },
    }));

  const updateCandleRuleItem = (id: string, patch: Partial<{ key: string; params: Record<string, unknown> }>) =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        candleRules: rule.exit.candleRules.map((r) =>
          r.id === id ? { ...r, ...patch } : r
        ),
      },
    }));

  const removeCandleRule = (id: string) =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        candleRules: rule.exit.candleRules.filter((r) => r.id !== id),
      },
    }));

  const setTpPct = (v: number | null) =>
    update((rule) => ({ exit: { ...rule.exit, tpPct: v } }));

  const setSlPct = (v: number | null) =>
    update((rule) => ({ exit: { ...rule.exit, slPct: v } }));

  const setTpTimeMin = (v: number | null) =>
    update((rule) => ({ exit: { ...rule.exit, tpTimeMin: v } }));

  const setSlTimeMin = (v: number | null) =>
    update((rule) => ({ exit: { ...rule.exit, slTimeMin: v } }));

  const setForcedExitStart = (time: string | null) =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        forcedExit: { ...rule.exit.forcedExit, start: time },
      },
    }));

  const setForcedExitEnd = (time: string | null) =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        forcedExit: { ...rule.exit.forcedExit, end: time },
      },
    }));

  const setTrailingActivate = (v: number | null) =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        trailing: { ...rule.exit.trailing, activate: v },
      },
    }));

  const setTrailingTrail = (v: number | null) =>
    update((rule) => ({
      exit: {
        ...rule.exit,
        trailing: { ...rule.exit.trailing, trail: v },
      },
    }));

  const defaultCandleParams = (key: string) => {
    switch (key) {
      case "pinbar":
      case "engulfing":
      case "inside":
        return { signal: "bullish", entrySide: "long" };
      default:
        return { signal: "bullish", entrySide: "long" };
    }
  };

  return {
    exit,
    toggleLogic,
    setTpPips,
    setSlPips,
    getSide,
    setSide,
    addCandleRule,
    updateCandleRuleItem,
    removeCandleRule,
    defaultCandleParams,
    setTpPct,
    setSlPct,
    setTpTimeMin,
    setSlTimeMin,
    setForcedExitStart,
    setForcedExitEnd,
    setTrailingActivate,
    setTrailingTrail,
  };
}

/* =========================================================
   Exit Section UI（文字列のみ多言語化）
   ========================================================= */

export function ExitSection() {
  const t = useTranslations("Exit");

  const {
    exit,
    toggleLogic,
    getSide,
    setSide,
    addCandleRule,
    updateCandleRuleItem,
    defaultCandleParams,
    setForcedExitStart,
    setForcedExitEnd,
    setTrailingActivate,
    setTrailingTrail,
  } = useExitHandlers();

  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-base font-semibold">
          {t("title")}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={
              exit.logic === "OR"
                ? "font-medium"
                : "text-muted-foreground"
            }
          >
            {t("logic.or")}
          </span>
          <Switch
            checked={exit.logic === "AND"}
            onCheckedChange={toggleLogic}
          />
          <span
            className={
              exit.logic === "AND"
                ? "font-medium"
                : "text-muted-foreground"
            }
          >
            {t("logic.and")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="long" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="long">{t("tabs.long")}</TabsTrigger>
            <TabsTrigger value="short">{t("tabs.short")}</TabsTrigger>
          </TabsList>

          <TabsContent value="long" className="mt-4">
            <ExitSideForm
              side="long"
              sideState={getSide("long")}
              setSide={setSide}
              t={t}
            />
          </TabsContent>
          <TabsContent value="short" className="mt-4">
            <ExitSideForm
              side="short"
              sideState={getSide("short")}
              setSide={setSide}
              t={t}
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("candleExit.label")}
            </label>
            <Select
              value={exit.candleRules[0]?.key ?? ""}
              onValueChange={(v) => {
                if (exit.candleRules.length === 0) addCandleRule();
                else
                  updateCandleRuleItem(exit.candleRules[0].id, {
                    key: v,
                    params: defaultCandleParams(v),
                  });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("candleExit.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pinbar">{t("candleExit.patterns.pinbar")}</SelectItem>
                <SelectItem value="engulfing">{t("candleExit.patterns.engulfing")}</SelectItem>
                <SelectItem value="inside">{t("candleExit.patterns.inside")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("forcedExit.start")}</label>
            <Input
              type="time"
              value={exit.forcedExit.start ?? ""}
              onChange={(e) => setForcedExitStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("forcedExit.end")}</label>
            <Input
              type="time"
              value={exit.forcedExit.end ?? ""}
              onChange={(e) => setForcedExitEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/60 space-y-4">
          <h3 className="text-sm font-semibold">{t("trailing.title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UnitInput
              label={t("trailing.activate")}
              unit={t("trailing.unit")}
              value={exit.trailing.activate ?? ""}
              onChange={(v) => setTrailingActivate(parseNumeric(v))}
            />
            <UnitInput
              label={t("trailing.trail")}
              unit={t("trailing.unit")}
              value={exit.trailing.trail ?? ""}
              onChange={(v) => setTrailingTrail(parseNumeric(v))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExitSideForm({
  side,
  sideState,
  setSide,
  t,
}: {
  side: "long" | "short";
  sideState: ExitSideState;
  setSide: (side: "long" | "short", patch: Partial<ExitSideState>) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UnitInput
          label={t("tpSl.tp")}
          unit={t("tpSl.unitPips")}
          value={sideState.tpPips ?? ""}
          onChange={(v) => setSide(side, { tpPips: parseNumeric(v) })}
        />
        <UnitInput
          label={t("tpSl.sl")}
          unit={t("tpSl.unitPips")}
          value={sideState.slPips ?? ""}
          onChange={(v) => setSide(side, { slPips: parseNumeric(v) })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UnitInput
          label={t("equity.tp")}
          unit={t("equity.unit")}
          value={sideState.tpPct ?? ""}
          onChange={(v) => setSide(side, { tpPct: parseNumeric(v) })}
        />
        <UnitInput
          label={t("equity.sl")}
          unit={t("equity.unit")}
          value={sideState.slPct ?? ""}
          onChange={(v) => setSide(side, { slPct: parseNumeric(v) })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UnitInput
          label={t("timeLimit.tp")}
          unit={t("timeLimit.unit")}
          value={sideState.tpTimeMin ?? ""}
          onChange={(v) => setSide(side, { tpTimeMin: parseNumeric(v) })}
        />
        <UnitInput
          label={t("timeLimit.sl")}
          unit={t("timeLimit.unit")}
          value={sideState.slTimeMin ?? ""}
          onChange={(v) => setSide(side, { slTimeMin: parseNumeric(v) })}
        />
      </div>
    </div>
  );
}

function parseNumeric(val: string): number | null {
  const s = val.trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
