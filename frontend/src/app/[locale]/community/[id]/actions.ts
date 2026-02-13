"use server";

import { createReply } from "@/lib/community";
import { revalidatePath } from "next/cache";

export async function submitReply(formData: FormData) {
  const postId = (formData.get("post_id") as string) ?? "";
  const locale = (formData.get("locale") as string) ?? "ja";
  const body = (formData.get("body") as string) ?? "";
  const author_display = (formData.get("author_display") as string) ?? null;

  if (!postId) return { error: "invalid_post" };

  const result = await createReply({
    post_id: postId,
    body,
    author_display: author_display || undefined,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath(`/${locale}/community/${postId}`);
  return { ok: true };
}
