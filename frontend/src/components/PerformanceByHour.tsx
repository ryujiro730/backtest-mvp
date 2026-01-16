"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyPerformanceChart } from "@/components/charts/HourlyPerformanceChart";

export function PerformanceByHour() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>時間帯別パフォーマンス</CardTitle>
      </CardHeader>
      <CardContent>
        <HourlyPerformanceChart />
      </CardContent>
    </Card>
  );
}
