"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnDistributionChart } from "@/components/charts/ReturnDistributionChart";

export function ReturnDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>リターン分布</CardTitle>
      </CardHeader>
      <CardContent>
        <ReturnDistributionChart />
      </CardContent>
    </Card>
  );
}
