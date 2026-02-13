import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getCommunityPostById,
  getRepliesByPostId,
} from "@/lib/community";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReplyForm from "./ReplyForm";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getCommunityPostById(id);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | Community`,
    description: post.body.slice(0, 160),
  };
}

export default async function CommunityPostPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Community" });
  const [post, replies] = await Promise.all([
    getCommunityPostById(id),
    getRepliesByPostId(id),
  ]);

  if (!post) notFound();

  const isSameLocale = post.locale === locale;
  const dateStr = new Date(post.created_at).toLocaleDateString(
    locale === "ja" ? "ja-JP" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const timeOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 lg:py-16">
      <Link
        href="/community"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← {t("backToList")}
      </Link>

      <article className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {!isSameLocale && (
          <p className="mb-4 text-xs text-amber-700">
            {t("differentLocale")}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <span>{post.author_display || t("anonymous")}</span>
          <span>·</span>
          <time dateTime={post.created_at}>{dateStr}</time>
        </div>
        <div className="mt-6 whitespace-pre-wrap text-slate-700 leading-relaxed">
          {post.body}
        </div>
      </article>

      <section className="mt-10" aria-label={t("repliesSectionTitle")}>
        <h2 className="text-lg font-semibold text-slate-900">
          {t("repliesSectionTitle")} ({replies.length})
        </h2>

        {replies.length > 0 && (
          <ul className="mt-4 space-y-4">
            {replies.map((reply) => (
              <li
                key={reply.id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{reply.author_display || t("anonymous")}</span>
                  <span>·</span>
                  <time dateTime={reply.created_at}>
                    {new Date(reply.created_at).toLocaleString(
                      locale === "ja" ? "ja-JP" : "en-US",
                      timeOpts
                    )}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {reply.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            {t("replyFormTitle")}
          </h3>
          <ReplyForm key={replies.length} postId={id} locale={locale} />
        </div>
      </section>
    </main>
  );
}
