"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StreakBarChart } from "@/components/charts/StreakBarChart";

export function StreakOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>連勝・連敗分析</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 数値サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="最大連勝" value="7" />
          <Metric label="最大連敗" value="5" />
          <Metric label="平均連勝" value="2.1" />
          <Metric label="平均連敗" value="1.8" />
        </div>

        {/* 連敗分布 */}
        <div>
          <h3 className="text-sm font-medium mb-2">連敗回数の分布</h3>
          <StreakBarChart />
        </div>

        {/* 注意喚起 */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="destructive">注意</Badge>
          <span>
            4連敗以上は資金管理・メンタルへの影響が大きい可能性があります
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
