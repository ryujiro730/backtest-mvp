"use client";

import { useEffect, useRef } from "react";
import { useRuleStore } from "./store";
import { SectionAccordion } from "../components/common/SectionAccordion";
import { TradingConditions } from "../components/sections/TradingConditions";
import { IndicatorThreshold } from "../components/sections/IndicatorThreshold";
import { TimeZoneSection } from "../components/sections/TimeZoneSection";
import { PriceActionSection } from "../components/sections/PriceActionSection";
import { ChartPatternSection } from "../components/sections/ChartPatternSection";
import { ExitSection } from "../components/sections/ExitSection";
import { ExecutionCondition } from "@/components/sections/ExecutionCondition";
import { useTranslations } from "next-intl";

export function RulesBuilder() {
  const rule = useRuleStore((s) => s.rule);
  const update = useRuleStore((s) => s.update);
  const t = useTranslations("RulesBuilder");

  // 「中身が 0 → 1 以上になったときだけ」自動でチェックをON。ユーザーが外したチェックは上書きしない
  const prevIndicatorLen = useRef(rule.indicatorThreshold.rules.length);
  useEffect(() => {
    const len = rule.indicatorThreshold.rules.length;
    if (len > 0 && prevIndicatorLen.current === 0) {
      update({
        indicatorThreshold: { ...rule.indicatorThreshold, enabled: true },
      });
    }
    prevIndicatorLen.current = len;
  }, [rule.indicatorThreshold.rules.length]);

  const prevTimeHasContent = useRef(
    Object.values(rule.timeZone.daysOfWeek || {}).some(Boolean)
      || rule.timeZone.intraday?.enabled
      || !!(rule.timeZone.period?.start || rule.timeZone.period?.end)
  );
  useEffect(() => {
    const hasTime = Object.values(rule.timeZone.daysOfWeek || {}).some(Boolean)
      || rule.timeZone.intraday?.enabled
      || !!(rule.timeZone.period?.start || rule.timeZone.period?.end);
    if (hasTime && !prevTimeHasContent.current) {
      const current = useRuleStore.getState().rule.timeZone;
      update({
        timeZone: { ...current, enabled: true },
      });
    }
    prevTimeHasContent.current = hasTime;
  }, [
    rule.timeZone.daysOfWeek,
    rule.timeZone.intraday?.enabled,
    rule.timeZone.period?.start,
    rule.timeZone.period?.end,
  ]);

  const prevPriceLen = useRef(rule.priceAction.rules.length);
  useEffect(() => {
    const len = rule.priceAction.rules.length;
    if (len > 0 && prevPriceLen.current === 0) {
      update({
        priceAction: { ...rule.priceAction, enabled: true },
      });
    }
    prevPriceLen.current = len;
  }, [rule.priceAction.rules.length]);

  const prevChartLen = useRef(rule.chartPattern.rules.length);
  useEffect(() => {
    const len = rule.chartPattern.rules.length;
    if (len > 0 && prevChartLen.current === 0) {
      update({
        chartPattern: { ...rule.chartPattern, enabled: true },
      });
    }
    prevChartLen.current = len;
  }, [rule.chartPattern.rules.length]);

  const hasExitContent = () =>
    rule.exit.tpPips != null || rule.exit.slPips != null
    || rule.exit.tpPct != null || rule.exit.slPct != null
    || (rule.exit.long && (rule.exit.long.tpPips != null || rule.exit.long.slPips != null))
    || (rule.exit.short && (rule.exit.short.tpPips != null || rule.exit.short.slPips != null));
  const prevExitHasContent = useRef(hasExitContent());
  useEffect(() => {
    const has = hasExitContent();
    if (has && !prevExitHasContent.current) {
      const current = useRuleStore.getState().rule.exit;
      update({ exit: { ...current, enabled: true } });
    }
    prevExitHasContent.current = has;
  }, [
    rule.exit.tpPips,
    rule.exit.slPips,
    rule.exit.tpPct,
    rule.exit.slPct,
    rule.exit.long,
    rule.exit.short,
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="mb-6">
        <ExecutionCondition />
      </div>

      <div className="space-y-6">
        <SectionAccordion
          id="trading"
          title={t("sections.trading")}
          enabled={true}
          onToggleEnabled={() => {}}
        >
          <TradingConditions />
        </SectionAccordion>

        <SectionAccordion
          id="indicator"
          title={t("sections.indicator")}
          enabled={rule.indicatorThreshold.enabled}
          listenToInput={false}
          onToggleEnabled={(v) =>
            update({
              indicatorThreshold: {
                ...rule.indicatorThreshold,
                enabled: v,
              },
            })
          }
        >
          <IndicatorThreshold />
        </SectionAccordion>

        <SectionAccordion
          id="time"
          title={t("sections.time")}
          enabled={rule.timeZone.enabled}
          onToggleEnabled={(v) =>
            update({
              timeZone: {
                ...rule.timeZone,
                enabled: v,
              },
            })
          }
        >
          <TimeZoneSection />
        </SectionAccordion>

        <SectionAccordion
          id="price"
          title={t("sections.price")}
          enabled={rule.priceAction.enabled}
          onToggleEnabled={(v) =>
            update({
              priceAction: {
                ...rule.priceAction,
                enabled: v,
              },
            })
          }
        >
          <PriceActionSection />
        </SectionAccordion>

        <SectionAccordion
          id="chartPattern"
          title={t("sections.chartPattern")}
          enabled={rule.chartPattern.enabled}
          onToggleEnabled={(v) =>
            update({
              chartPattern: {
                ...rule.chartPattern,
                enabled: v,
              },
            })
          }
        >
          <ChartPatternSection />
        </SectionAccordion>

        <SectionAccordion
          id="exit"
          title={t("sections.exit")}
          enabled={rule.exit.enabled}
          listenToInput={false}
          onToggleEnabled={(v) => {
            const current = useRuleStore.getState().rule.exit;
            update({ exit: { ...current, enabled: v } });
          }}
        >
          <ExitSection />
        </SectionAccordion>
      </div>
    </div>
  );
}
