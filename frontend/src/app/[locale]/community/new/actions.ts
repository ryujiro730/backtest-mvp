"use server";

import { createCommunityPost } from "@/lib/community";
import { redirect } from "next/navigation";

export async function submitPost(formData: FormData) {
  const locale = (formData.get("locale") as string) ?? "ja";
  const title = (formData.get("title") as string) ?? "";
  const body = (formData.get("body") as string) ?? "";
  const author_display = (formData.get("author_display") as string) ?? null;

  const result = await createCommunityPost({
    title,
    body,
    locale,
    author_display: author_display || undefined,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  redirect(`/${locale}/community/${result.id}`);
}
