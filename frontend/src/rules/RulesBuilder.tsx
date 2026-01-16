"use client";

import { useRuleStore } from "./store";
import { SectionAccordion } from "../components/common/SectionAccordion";
import { LogicSwitch } from "../components/common/LogicSwitch";

import { TradingConditions } from "../components/sections/TradingConditions";
import { IndicatorThreshold } from "../components/sections/IndicatorThreshold";
import { TimeZoneSection } from "../components/sections/TimeZoneSection";
import { PriceActionSection } from "../components/sections/PriceActionSection";
import { ChartPatternSection } from "../components/sections/ChartPatternSection";
import { ExitSection } from "../components/sections/ExitSection";
import { ExecutionCondition } from "@/components/sections/ExecutionCondition";

export function RulesBuilder() {
const rule = useRuleStore((s) => s.rule);
const update = useRuleStore((s) => s.update);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          エントリー／エグジットルールの定義
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          バックテスト用の戦略ルールを定義します
        </p>
      </div>

      <ExecutionCondition />

      <SectionAccordion
        id="trading"
        title="取引条件"
        enabled={true}
        onToggleEnabled={() => {}}
      >
        <TradingConditions />
      </SectionAccordion>

      <SectionAccordion
        id="indicator"
        title="インジケーター条件"
        enabled={rule.indicatorThreshold.enabled}
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
        title="時間帯"
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
        title="プライスアクション"
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
        title="チャートパターン"
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
        title="エグジットルール"
        enabled={rule.exit.enabled}
        onToggleEnabled={(v) =>
          update({
            exit: {
              ...rule.exit,
              enabled: v,
            },
          })
        }
      >
        <ExitSection />
      </SectionAccordion>
    </div>
  );
}
