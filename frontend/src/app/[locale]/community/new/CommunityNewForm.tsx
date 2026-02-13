"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitPost } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CommunityNewForm({ locale }: { locale: string }) {
  const t = useTranslations("Community");
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => submitPost(formData),
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {state && typeof state === "object" && "error" in state && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {((): string => {
            const err = (state as { error: string }).error;
            if (err === "title_too_long") return t("errorTitleTooLong");
            if (err === "body_too_long") return t("errorBodyTooLong");
            return t("errorGeneric");
          })()}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">{t("fieldTitle")}</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder={t("placeholderTitle")}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">{t("fieldBody")}</Label>
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          maxLength={10000}
          placeholder={t("placeholderBody")}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author_display">{t("fieldAuthorDisplay")}</Label>
        <Input
          id="author_display"
          name="author_display"
          maxLength={64}
          placeholder={t("placeholderAuthorDisplay")}
          className="w-full"
        />
        <p className="text-xs text-slate-500">{t("fieldAuthorDisplayHint")}</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {t("submit")}
        </Button>
        <Button type="reset" variant="outline">
          {t("reset")}
        </Button>
      </div>
    </form>
  );
}
