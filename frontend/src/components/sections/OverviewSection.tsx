"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";
import { WeekdayBarChart } from "@/components/charts/WeekdayBarChart";

export function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="総トレード数" value="128" />
        <KpiCard title="勝率" value="56.2%" />
        <KpiCard title="最大DD" value="-12.4%" />
        <KpiCard title="PF" value="1.42" />
      </div>

      {/* Equity */}
      <Card>
        <CardHeader>
          <CardTitle>エクイティカーブ</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <EquityCurveChart />
        </CardContent>
      </Card>

      {/* 下段 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ドローダウン推移</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <DrawdownChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>曜日別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <WeekdayBarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
