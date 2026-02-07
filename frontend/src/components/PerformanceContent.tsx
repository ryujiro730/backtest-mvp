import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { WeekdayBarChart } from "@/components/charts/WeekdayBarChart";
import { ReturnDistributionChart } from "@/components/charts/ReturnDistributionChart";
import { HourlyPerformanceChart } from "@/components/charts/HourlyPerformanceChart";
import { StreakBarChart } from "@/components/charts/StreakBarChart";
import { DurationProfitScatterChart } from "@/components/charts/DurationProfitScatterChart";
import { KPIOverview } from "./KPIOverview";
import { PerformanceXShareButton } from "./performance/PerformanceXShareButton";
import { TradeFrequencyHeatmapGrid } from "@/components/charts/TradeFrequencyHeatmapGrid";
import { EquityByTradeTypeChart } from "@/components/charts/EquityByTradeTypeChart";
import { useMemo } from "react";
import { calcDrawdown } from "@/lib/utils/calcDrawdown";
import { thinData, CHART_MAX_POINTS } from "@/lib/utils/thin";
import { buildTradeTypeEquitySeries } from "@/lib/performance/transform";
import {
  buildEquitySeries,
  buildWeekdaySeries,
  buildReturnHistogram,
  buildHourlySeries,
  buildLosingStreakSeries,
  buildDurationScatter,
  buildTradeFrequency,
  type PerformanceRaw,
} from "@/lib/performance/transform";
import { useTranslations } from "next-intl";

type Props = {
  tab: string;
  data: PerformanceRaw | null;
};

export function PerformanceContent({ tab, data }: Props) {
  const t = useTranslations("Performance");

  const derived = useMemo(() => {
    if (!data) return null;
    const thinnedEquity = thinData(data.equity, CHART_MAX_POINTS);
    const tradeCount = data.trades?.length ?? 0;
    const thinnedTrades =
      tradeCount > CHART_MAX_POINTS
        ? thinData(data.trades, CHART_MAX_POINTS)
        : data.trades;

    const base = {
      equitySeries: buildEquitySeries(thinnedEquity),
      drawdownData: calcDrawdown(thinnedEquity),
      weekdaySeries: buildWeekdaySeries(data.trades),
      returnHistogram: buildReturnHistogram(data.trades),
      hourlySeries: buildHourlySeries(data.trades),
      losingStreakSeries: buildLosingStreakSeries(data.trades),
      tradeFrequency: buildTradeFrequency(data.trades),
      durationScatter: [] as ReturnType<typeof buildDurationScatter>,
      tradeTypeSeries: [] as ReturnType<typeof buildTradeTypeEquitySeries>,
    };

    if (tab === "duration") {
      base.durationScatter = buildDurationScatter(thinnedTrades);
    }
    if (tab === "equity") {
      base.tradeTypeSeries =
        tradeCount > CHART_MAX_POINTS
          ? thinData(buildTradeTypeEquitySeries(data.trades), CHART_MAX_POINTS)
          : buildTradeTypeEquitySeries(data.trades);
    }

    return base;
  }, [data, tab]);

  if (!data) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!derived) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  const {
    equitySeries,
    drawdownData,
    weekdaySeries,
    returnHistogram,
    hourlySeries,
    losingStreakSeries,
    durationScatter,
    tradeFrequency,
    tradeTypeSeries,
  } = derived;

  switch (tab) {
    case "overview":
      return (
        <div className="space-y-6">
          <KPIOverview
            pf={data.summary.pf}
            winrate={data.summary.winrate}
            maxdd={data.summary.maxdd}
            trades={data.summary.trades}
          />

          <div className="flex flex-wrap items-center gap-3">
            <PerformanceXShareButton pf={data.summary.pf} ruinPct={null} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.equityCurve")}</CardTitle>
            </CardHeader>
            <CardContent>
              <EquityCurveChart data={equitySeries} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("tabs.drawdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <DrawdownChart data={drawdownData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("tabs.weekday")}</CardTitle>
              </CardHeader>
              <CardContent>
                <WeekdayBarChart data={weekdaySeries} />
              </CardContent>
            </Card>
          </div>
        </div>
      );

    case "returns":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.returns")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReturnDistributionChart data={returnHistogram} />
          </CardContent>
        </Card>
      );

    case "hour":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.hourly")}</CardTitle>
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
            <CardTitle>{t("tabs.streak")}</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakBarChart data={losingStreakSeries} />
          </CardContent>
        </Card>
      );

    case "duration":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.duration")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DurationProfitScatterChart data={durationScatter} />
          </CardContent>
        </Card>
      );

    case "heatmap":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.heatmap")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeFrequencyHeatmapGrid data={tradeFrequency} />
          </CardContent>
        </Card>
      );

    case "equity":
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t("tabs.equityByType")}</CardTitle>
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
