"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { useTranslations } from "next-intl";

type Props = {
  pf: number;
  winrate: number; // 0–1
  maxdd: number;   // 0–1
  trades: number;
};

export function KPIOverview({ pf, winrate, maxdd, trades }: Props) {
  const t = useTranslations("KPI");

  const pfText = pf.toFixed(2);
  const winrateText = (winrate * 100).toFixed(1) + "%";
  const maxddText = "-" + (maxdd * 100).toFixed(1) + "%";
  const tradesText =
    trades.toLocaleString() + " " + t("trades.unit");

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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {t("pf.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={clsx("text-2xl font-bold", pfColor)}>
            {pfText}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("pf.desc")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {t("winrate.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {winrateText}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("winrate.desc")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {t("maxdd.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={clsx("text-2xl font-bold", ddColor)}>
            {maxddText}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("maxdd.desc")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {t("trades.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tradesText}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("trades.desc")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
