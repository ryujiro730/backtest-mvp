import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { WeekdayBarChart } from "@/components/charts/WeekdayBarChart";
import { ReturnDistributionChart } from "@/components/charts/ReturnDistributionChart";
import { HourlyPerformanceChart } from "@/components/charts/HourlyPerformanceChart";
import { StreakBarChart } from "@/components/charts/StreakBarChart";
import { DurationProfitScatterChart } from "@/components/charts/DurationProfitScatterChart";
import { KPIOverview } from "./KPIOverview";
import { TradeFrequencyHeatmapGrid } from "@/components/charts/TradeFrequencyHeatmapGrid";
import { EquityByTradeTypeChart } from "@/components/charts/EquityByTradeTypeChart";
import { useMemo } from "react";
import { calcDrawdown } from "@/lib/utils/calcDrawdown";
import { thinData } from "@/lib/utils/thin";
import { buildTradeTypeEquitySeries } from "@/lib/performance/transform";
import {
  buildEquitySeries,
  buildDrawdownSeries,
  buildWeekdaySeries,
  buildReturnHistogram,
  buildHourlySeries,
  buildLosingStreakSeries,
  buildDurationScatter,
  buildTradeFrequency,
  type PerformanceRaw,
} from "@/lib/performance/transform";

type Props = {
  tab: string;
  data: PerformanceRaw | null; // null のときはローディング or プレースホルダー
};



export function PerformanceContent({ tab, data }: Props) {
  if (!data) {
    return <div className="p-4 text-sm text-muted-foreground">データ読込中...</div>;
  }

  const equitySeries = buildEquitySeries(data.equity);
  const ddSeries = buildDrawdownSeries(data.equity);
  const weekdaySeries = buildWeekdaySeries(data.trades);
  const hourlySeries = buildHourlySeries(data.trades);
  const returnsHist = buildReturnHistogram(data.trades);
  const streakSeries = buildLosingStreakSeries(data.trades);
  const durationScatter = buildDurationScatter(data.trades);
  const tradeTypeSeries = buildTradeTypeEquitySeries(data.trades);

console.log("tradeTypeSeries:", tradeTypeSeries.slice(0, 10));


  switch (tab) {
case "overview": {
  const thinned = useMemo(() => thinData(data.equity, 2000), [data.equity]);
  const drawdownData = useMemo(() => calcDrawdown(thinned), [thinned]);

  return (
    <div className="space-y-6">
      {/* ★ KPI（summary.json 直結） */}
      <KPIOverview
        pf={data.summary.pf}
        winrate={data.summary.winrate}
        maxdd={data.summary.maxdd}
        trades={data.summary.trades}
      />

      {/* エクイティ */}
      <Card>
        <CardHeader>
          <CardTitle>エクイティカーブ</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart data={buildEquitySeries(data.equity)} />
        </CardContent>
      </Card>

      {/* DD + 曜日 */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ドローダウン</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawdownChart data={drawdownData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>曜日別</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekdayBarChart
              data={buildWeekdaySeries(data.trades)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


    case "returns":
      return (
        <Card>
          <CardHeader>
            <CardTitle>リターン分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ReturnDistributionChart data={returnsHist} />
          </CardContent>
        </Card>
      );

    case "hour":
      return (
        <Card>
          <CardHeader>
            <CardTitle>時間別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent>
            <HourlyPerformanceChart data={hourlySeries} />
          </CardContent>
        </Card>
      );

    case "streak":
      return (
        <Card>
          <CardHeader>
            <CardTitle>連勝・連敗</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakBarChart data={streakSeries} />
          </CardContent>
        </Card>
      );

    case "duration":
      return (
        <Card>
          <CardHeader>
            <CardTitle>保有時間と損益</CardTitle>
          </CardHeader>
          <CardContent>
            <DurationProfitScatterChart data={durationScatter} />
          </CardContent>
        </Card>
      );

case "heatmap": {

  const freq = buildTradeFrequency(data.trades);

  return (
    <Card>
      <CardHeader>
        <CardTitle>頻度ヒートマップ</CardTitle>
      </CardHeader>
      <CardContent>
        <TradeFrequencyHeatmapGrid data={freq} />
      </CardContent>
    </Card>
  );
}


case "equity":
  console.log("tradeTypeSeries:", tradeTypeSeries)
  return (
    <Card>
      <CardHeader>
        <CardTitle>トレード種別エクイティ推移</CardTitle>
      </CardHeader>
      <CardContent>
        <EquityByTradeTypeChart data={tradeTypeSeries} />
      </CardContent>
    </Card>
  );



    default:
      return null;
  }
}
