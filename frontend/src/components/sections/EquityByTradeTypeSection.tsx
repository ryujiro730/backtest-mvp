import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EquityByTradeTypeChart } from "@/components/charts/EquityByTradeTypeChart";

export function EquityByTradeTypeSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>トレード種別エクイティ推移</CardTitle>
      </CardHeader>
      <CardContent>
        <EquityByTradeTypeChart />
      </CardContent>
    </Card>
  );
}
