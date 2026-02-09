"use client";

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
    </aside>
  );
}
