"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimeHeatmap } from "./TimeHeatmap";

export function HeatmapCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>時間帯 × 曜日 ヒートマップ</CardTitle>
      </CardHeader>
      <CardContent>
        <TimeHeatmap />
      </CardContent>
    </Card>
  );
}
