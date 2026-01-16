"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { WeekdayBarChart } from "@/components/charts/WeekdayBarChart";

export function PerformanceOverview() {
  return (
    <div className="space-y-6">
      {/* 上段：エクイティ */}
      <Card>
        <CardHeader>
          <CardTitle>エクイティカーブ</CardTitle>
        </CardHeader>
        <CardContent>
          <EquityCurveChart />
        </CardContent>
      </Card>

      {/* 下段：ドローダウン＋曜日別 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ドローダウン推移</CardTitle>
          </CardHeader>
          <CardContent>
            <DrawdownChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>曜日別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekdayBarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
