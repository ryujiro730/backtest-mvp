"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TradeFrequencyHeatmapGrid } from "@/components/charts/TradeFrequencyHeatmapGrid";

export function TradeFrequencyHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>トレード頻度ヒートマップ</CardTitle>
      </CardHeader>
      <CardContent>
        <TradeFrequencyHeatmapGrid />
      </CardContent>
    </Card>
  );
}
