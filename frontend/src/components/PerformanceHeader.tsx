"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PerformanceHeader() {
  const router = useRouter();

  return (
    <div className="border-b px-4 py-3 flex items-start gap-3">
      {/* 戻るボタン */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/app")}
        className="mt-1"
        aria-label="戻る"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* タイトル */}
      <div>
        <h1 className="text-lg font-bold">パフォーマンス分析</h1>
        <p className="text-sm text-muted-foreground">
          バックテスト結果の詳細分析
        </p>
      </div>
    </div>
  );
}
