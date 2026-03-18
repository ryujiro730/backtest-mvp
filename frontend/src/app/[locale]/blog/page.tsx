// app/blog/page.tsx
import { Link } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllPostsMeta } from "@/lib/blog/mdx";

/* =========================
   Metadata（locale対応）
========================= */
type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ category?: string }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { locale } = await params; // ← ここが肝

  const t = await getTranslations({ locale, namespace: "Blog" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}


/* =========================
   Category 定義（slug固定）
========================= */
const categoryConfig = [
  { slug: "all", key: "all" },
  { slug: "strategy", key: "strategy" },
  { slug: "indicator", key: "indicator" },
  { slug: "risk", key: "risk" },
  { slug: "analysis", key: "analysis" },
  { slug: "other", key: "other" },
] as const;

type CategorySlug = (typeof categoryConfig)[number]["slug"];

/* =========================
   Page
========================= */

export default async function BlogPage(props: PageProps) {
  const { locale } = await props.params; // ← ここも Promise unwrap
  const t = await getTranslations({ locale, namespace: "Blog" }); // ← locale 明示（これがないと ja に寄る）

  const searchParams = await props.searchParams;
  const posts = await getAllPostsMeta(locale);


  const requestedSlug = searchParams?.category;
  const activeSlug: CategorySlug =
    requestedSlug && categoryConfig.some((c) => c.slug === requestedSlug)
      ? (requestedSlug as CategorySlug)
      : "all";

  const filteredPosts =
    activeSlug === "all"
      ? posts
      : posts.filter((post) => post.category === activeSlug);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
        {/* ===== Header ===== */}
        <header className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium tracking-widest text-emerald-700">
            {t("badge")}
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t("headline")}
          </h1>

          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            {t("description")}
          </p>
        </header>

        {/* ===== Category Nav ===== */}
        <nav
          aria-label={t("aria.categories")}
          className="mt-8 flex flex-wrap gap-2 text-xs sm:text-sm"
        >
          {categoryConfig.map((cat) => {
            const isActive = cat.slug === activeSlug;
const href =
  cat.slug === "all"
    ? `/${locale}/blog`
    : `/${locale}/blog?category=${cat.slug}`;


            return (
              <Link
                key={cat.slug}
                href={href}
                className={[
                  "rounded-full border px-3 py-1 transition",
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50",
                ].join(" ")}
              >
                {t(`categories.${cat.key}`)}
              </Link>
            );
          })}
        </nav>

        {/* ===== Articles ===== */}
        <section className="mt-10" aria-label={t("aria.articles")}>
          {filteredPosts.length === 0 && (
            <p className="text-sm text-slate-500">
              {t("empty")}
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <Link
                key={post.sourcePath}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <article className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide text-slate-500">
                    <span>{post.category}</span>
                    <span>・</span>
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString(
                        t("dateLocale")
                      )}
                    </time>
                    <span>・</span>
                    <span>
                      {t("readTime", { minutes: post.readTimeMinutes })}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                    <span className="line-clamp-2 group-hover:text-emerald-600">
                      {post.title}
                    </span>
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {post.description}
                  </p>

                  <span className="mt-3 inline-block text-xs font-semibold text-emerald-600">
                    {t("readMore")} →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="mt-16 rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("cta.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            {t("cta.description")}
          </p>
          <div className="mt-4">
            <Link
              href="/app"
              className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
