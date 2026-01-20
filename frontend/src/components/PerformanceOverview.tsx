// frontend/src/components/PerformanceOverview.tsx
"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { WeekdayBarChart } from "@/components/charts/WeekdayBarChart";

export function PerformanceOverview({
  equity,
  drawdown,
  weekday,
}: {
  equity: any[];
  drawdown: any[];
  weekday: any[];
}) {
  const TOTAL = 3;
  const [readyCount, setReadyCount] = useState(0);

  const onChartReady = () => {
    setReadyCount((c) => c + 1);
  };

  const allReady = readyCount >= TOTAL;

  return (
    <div className="relative space-y-6">
      {/* ★ スピナーをオーバーレイで被せる */}
      {!allReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Spinner className="h-4 w-4 animate-spin" />
            グラフ作成中…
          </div>
        </div>
      )}

      {/* ★ グラフは常に描画する */}
      <Card>
        <CardHeader>
          <CardTitle>エクイティカーブ</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart data={equity} onReady={onChartReady} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ドローダウン推移</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawdownChart data={drawdown} onReady={onChartReady} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>曜日別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekdayBarChart data={weekday} onReady={onChartReady} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
