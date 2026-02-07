"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AveragePLByOutcomeChart } from "@/components/charts/AveragePLByOutcomeChart";

export function AveragePLByOutcome() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>勝敗別 平均損益</CardTitle>
      </CardHeader>
      <CardContent>
        <AveragePLByOutcomeChart />
      </CardContent>
    </Card>
  );
}
