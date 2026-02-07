"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export type Tab =
  | "overview"
  | "returns"
  | "hour"
  | "heatmap"
  | "duration"
  | "streak"
  | "equity";

const itemIds: Tab[] = [
  "overview",
  "returns",
  "hour",
  "heatmap",
  "streak",
  "duration",
  "equity",
];

export function PerformanceSidebar({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
}) {
  const router = useRouter();
  const t = useTranslations("PerformanceSidebar");

  return (
    <aside className="hidden md:flex w-56 border-r bg-background p-4 flex-col">
      <ul className="space-y-1">
        {itemIds.map((id) => (
          <li key={id}>
            <button
              onClick={() => onChange(id)}
              className={`w-full rounded px-3 py-2 text-left text-sm
                ${
                  current === id
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              {t(`items.${id}`)}
            </button>
          </li>
        ))}
      </ul>

      {/* 下：戻る */}
      <div className="border-t p-3 mt-auto">
        <Button
          variant="outline"
          onClick={() => router.push("/app")}
          className="w-full justify-start items-start gap-2 px-3 py-2 text-sm leading-tight text-muted-foreground"
        >
          <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="text-left">
            {t("back.line1")}
            <br />
            {t("back.line2")}
          </span>
        </Button>
      </div>
    </aside>
  );
}
