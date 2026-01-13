"use client";

import { Accordion } from "./components/Accordion";
import { SectionHeader } from "./components/SectionHeader";

import { TradingConditions } from "./sections/TradingConditions";
import { IndicatorThreshold } from "./sections/IndicatorThreshold";
import { TimeZoneSection } from "./sections/TimeZoneSection";
import { PriceActionSection } from "./sections/PriceActionSection";
import { ExitSection } from "./sections/ExitSection";

import { useRuleStore } from "./store";

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
        <p className="text-sm text-gray-500 mt-1">
          バックテスト用の戦略ルールを定義します
        </p>
      </div>

      {/* 取引条件（logicなし） */}
      <Accordion
        enabled={true}
        onToggleEnabled={() => {}}
        header={
          <SectionHeader title="取引条件" />
        }
      >
        <TradingConditions />
      </Accordion>

      {/* インジケーター条件（AND / OR） */}
      <Accordion
        enabled={rule.indicatorThreshold.enabled}
        onToggleEnabled={(v) =>
          update({
            indicatorThreshold: {
              ...rule.indicatorThreshold,
              enabled: v,
            },
          })
        }
        header={
          <SectionHeader
            title="インジケーター条件"
            logic={rule.indicatorThreshold.logic}
            onChangeLogic={(logic) =>
              update({
                indicatorThreshold: {
                  ...rule.indicatorThreshold,
                  logic,
                },
              })
            }
          />
        }
      >
        <IndicatorThreshold />
      </Accordion>

      {/* 時間帯 */}
      <Accordion
        enabled={rule.timeZone.enabled}
        onToggleEnabled={(v) =>
          update({
            timeZone: {
              ...rule.timeZone,
              enabled: v,
            },
          })
        }
        header={<SectionHeader title="時間帯" />}
      >
        <TimeZoneSection />
      </Accordion>

      {/* プライスアクション */}
      <Accordion
        enabled={rule.priceAction.enabled}
        onToggleEnabled={(v) =>
          update({
            priceAction: {
              ...rule.priceAction,
              enabled: v,
            },
          })
        }
        header={
          <SectionHeader
            title="プライスアクション"
            logic={rule.priceAction.logic}
            onChangeLogic={(logic) =>
              update({
                priceAction: {
                  ...rule.priceAction,
                  logic,
                },
              })
            }
          />
        }
      >
        <PriceActionSection />
      </Accordion>

      {/* エグジット */}
      <Accordion
        enabled={rule.exit.enabled}
        onToggleEnabled={(v) =>
          update({
            exit: {
              ...rule.exit,
              enabled: v,
            },
          })
        }
        header={<SectionHeader title="エグジットルール" />}
      >
        <ExitSection />
      </Accordion>
    </div>
  );
}
