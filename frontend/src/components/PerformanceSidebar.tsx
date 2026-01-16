"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  current: string;
  onChange: (v: string) => void;
};

type Tab =
  | "overview"
  | "returns"
  | "hour"
  | "heatmap"
  | "duration"
  | "streak"
  | "equity";

const items: { id: Tab; label: string }[] = [
  { id: "overview", label: "概要" },
  { id: "returns", label: "リターン分布" },
  { id: "hour", label: "時間別パフォーマンス" },
  { id: "heatmap", label: "頻度ヒートマップ" },
  { id: "streak", label: "連勝・連敗" },
  { id: "duration", label: "保有時間と損益" },
  { id: "equity", label: "トレード種別別エクイティ推移" }
];

export function PerformanceSidebar({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
}) 
{
    const router = useRouter();
  return (
    <aside className="w-56 border-r bg-background p-4 flex flex-col">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onChange(item.id)}
              className={`w-full rounded px-3 py-2 text-left text-sm
                ${
                  current === item.id
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
            {/* 下：戻る */}
<div className="border-t p-3 mt-auto">
  <Button
    variant="outline"
    onClick={() => router.push("/app")}
    className="
      w-full
      justify-start
      items-start
      gap-2
      px-3 py-2
      text-sm
      leading-tight
      text-muted-foreground
    "
  >
    <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0" />
    <span className="text-left">
      トレード設定へ<br />戻る
    </span>
  </Button>
</div>

    </aside>
  );
}
