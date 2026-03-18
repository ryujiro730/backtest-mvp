"use client";

import { useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function PerformanceHeader() {
  const router = useRouter();
  const t = useTranslations("PerformanceHeader");

  return (
    <div className="border-b px-4 py-3 flex items-start gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/app" as any)}
        className="mt-1"
        aria-label={t("back")}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div>
        <h1 className="text-lg font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
    </div>
  );
}
