import "server-only";
import { supabaseServerRO } from "@/lib/supabase-ssr";
import { supabaseServer } from "@/lib/supabase-ssr";

export type CommunityPost = {
  id: string;
  user_id: string | null;
  author_display: string | null;
  title: string;
  body: string;
  locale: string;
  created_at: string;
  updated_at: string;
};

const TITLE_MAX = 200;
const BODY_MAX = 10000;
const REPLY_BODY_MAX = 2000;

export type CommunityReply = {
  id: string;
  post_id: string;
  user_id: string | null;
  author_display: string | null;
  body: string;
  created_at: string;
};

/** ある投稿への返信一覧（古い順） */
export async function getRepliesByPostId(
  postId: string
): Promise<CommunityReply[]> {
  const supabase = await supabaseServerRO();
  const { data, error } = await supabase
    .from("community_replies")
    .select("id, post_id, user_id, author_display, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("community getRepliesByPostId error:", error);
    return [];
  }
  return (data ?? []) as CommunityReply[];
}

/** 投稿一覧を取得（locale でフィルタ、新しい順） */
export async function getCommunityPosts(locale: string): Promise<CommunityPost[]> {
  const supabase = await supabaseServerRO();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, author_display, title, body, locale, created_at, updated_at")
    .eq("locale", locale)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("community getCommunityPosts error:", error);
    return [];
  }
  return (data ?? []) as CommunityPost[];
}

/** 1件取得 */
export async function getCommunityPostById(
  id: string
): Promise<CommunityPost | null> {
  const supabase = await supabaseServerRO();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, author_display, title, body, locale, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as CommunityPost;
}

export type CreatePostInput = {
  title: string;
  body: string;
  locale: string;
  author_display?: string | null;
};

/** 投稿を作成（ログイン不要。匿名は user_id null）。成功時は id を返す。 */
export async function createCommunityPost(
  input: CreatePostInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) {
    return { error: "title_and_body_required" };
  }
  if (title.length > TITLE_MAX) {
    return { error: "title_too_long" };
  }
  if (body.length > BODY_MAX) {
    return { error: "body_too_long" };
  }
  if (!["ja", "en"].includes(input.locale)) {
    return { error: "invalid_locale" };
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user?.id ?? null,
      author_display: input.author_display?.trim() || null,
      title,
      body,
      locale: input.locale,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("community createCommunityPost error:", error);
    return { error: error.message };
  }
  return { id: data.id };
}

export type CreateReplyInput = {
  post_id: string;
  body: string;
  author_display?: string | null;
};

/** 返信を作成（ログイン不要）。成功時は id を返す。 */
export async function createReply(
  input: CreateReplyInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = input.body.trim();
  if (!body) {
    return { error: "body_required" };
  }
  if (body.length > REPLY_BODY_MAX) {
    return { error: "body_too_long" };
  }

  const { data, error } = await supabase
    .from("community_replies")
    .insert({
      post_id: input.post_id,
      user_id: user?.id ?? null,
      author_display: input.author_display?.trim() || null,
      body,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("community createReply error:", error);
    return { error: error.message };
  }
  return { id: data.id };
}
