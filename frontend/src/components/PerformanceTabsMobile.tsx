"use client";

import { useTranslations } from "next-intl";
import type { Tab } from "@/components/PerformanceSidebar";

const itemIds: Tab[] = [
  "overview",
  "returns",
  "hour",
  "heatmap",
  "streak",
  "duration",
  "equity",
];

export function PerformanceTabsMobile({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
}) {
  const t = useTranslations("PerformanceSidebar");

  return (
    <div className="md:hidden sticky top-0 z-10 bg-background border-b">
      <div className="flex overflow-x-auto">
        {itemIds.map((id) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`px-4 py-2 text-sm whitespace-nowrap
              ${
                current === id
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
          >
            {t(`items.${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
