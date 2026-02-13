import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getCommunityPosts } from "@/lib/community";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Community" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Community" });
  const posts = await getCommunityPosts(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t("description")}</p>
        </div>
        <Link
          href="/community/new"
          className="btn shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t("newPost")}
        </Link>
      </header>

      <section className="mt-10" aria-label={t("aria.posts")}>
        {posts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">{t("empty")}</p>
            <Link
              href="/community/new"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              {t("newPost")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/community/${post.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <h2 className="font-semibold text-slate-900 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {post.body}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {post.author_display || t("anonymous")}
                    </span>
                    <span>·</span>
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
