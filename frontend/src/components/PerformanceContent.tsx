import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { WeekdayBarChart } from "@/components/charts/WeekdayBarChart";
import { ReturnDistributionChart } from "@/components/charts/ReturnDistributionChart";
import { HourlyPerformanceChart } from "./charts/HourlyPerformanceChart";
import { StreakBarChart } from "./charts/StreakBarChart";
import { TradeFrequencyHeatmap } from "./TradeFrequencyHeatmap";
import { DurationProfitScatterChart } from "./charts/DurationProfitScatterChart";
import { EquityByTradeTypeChart } from "./charts/EquityByTradeTypeChart";

export function PerformanceContent({ tab }: { tab: string }) {
  switch (tab) {
    case "overview":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>エクイティカーブ</CardTitle></CardHeader>
            <CardContent><EquityCurveChart /></CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>ドローダウン</CardTitle></CardHeader>
              <CardContent><DrawdownChart /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>曜日別</CardTitle></CardHeader>
              <CardContent><WeekdayBarChart /></CardContent>
            </Card>
          </div>
        </div>
      );

    case "returns":
      return (
        <Card>
          <CardHeader><CardTitle>リターン分布</CardTitle></CardHeader>
          <CardContent><ReturnDistributionChart /></CardContent>
        </Card>
      );

    case "hour":
        return (
            <Card>
              <CardHeader><CardTitle>時間別パフォーマンス</CardTitle></CardHeader>
              <CardContent><HourlyPerformanceChart /></CardContent>
            </Card>
        );
    case "heatmap":
      return (
        <Card>
          <CardHeader><CardTitle>頻度ヒートマップ</CardTitle></CardHeader>
          <CardContent><TradeFrequencyHeatmap /></CardContent>
        </Card>
      );

    case "streak":
      return (
        <Card>
          <CardHeader><CardTitle>連勝・連敗</CardTitle></CardHeader>
          <CardContent><StreakBarChart /></CardContent>
        </Card>
      );

      case "duration":
        return (
          <Card>
            <CardHeader><CardTitle>保有時間と損益</CardTitle></CardHeader>
            <CardContent><DurationProfitScatterChart /></CardContent>
          </Card>
        );

      case "equity":
        return (
          <Card>
            <CardHeader><CardTitle>トレード種別別エクイティ推移</CardTitle></CardHeader>
            <CardContent><EquityByTradeTypeChart /></CardContent>
          </Card>
        );

    default:
      return null;
  }
}
