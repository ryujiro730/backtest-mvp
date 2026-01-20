// frontend/src/components/KPIOverview.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import clsx from "clsx";

type Props = {
  pf: number;        // プロフィットファクター
  winrate: number;   // 0–1
  maxdd: number;     // 0–1
  trades: number;    // 件数
};

export function KPIOverview({ pf, winrate, maxdd, trades }: Props) {
  // 表示用フォーマット
  const pfText = pf.toFixed(2);
  const winrateText = (winrate * 100).toFixed(1) + "%";
  const maxddText = "-" + (maxdd * 100).toFixed(1) + "%";
  const tradesText = trades.toLocaleString() + " 回";

  // 色ルール（判断が一瞬でつくように）
  const pfColor =
    pf < 1
      ? "text-red-600"
      : pf < 1.3
      ? "text-yellow-600"
      : "text-green-600";

  const ddColor =
    maxdd >= 0.5
      ? "text-red-600"
      : maxdd >= 0.3
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* プロフィットファクター */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            プロフィットファクター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={clsx("text-2xl font-bold", pfColor)}>
            {pfText}
          </div>
          <div className="text-xs text-muted-foreground">
            総利益 ÷ 総損失
          </div>
        </CardContent>
      </Card>

      {/* 勝率 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">勝率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {winrateText}
          </div>
          <div className="text-xs text-muted-foreground">
            勝ちトレードの割合
          </div>
        </CardContent>
      </Card>

      {/* 最大ドローダウン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">最大ドローダウン</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={clsx("text-2xl font-bold", ddColor)}>
            {maxddText}
          </div>
          <div className="text-xs text-muted-foreground">
            資金の最大下落率
          </div>
        </CardContent>
      </Card>

      {/* トレード数 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">トレード数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tradesText}
          </div>
          <div className="text-xs text-muted-foreground">
            検証に使った回数
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
