// src/app/[locale]/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

import { BlogCta } from "@/components/blog/BlogCta";
import RelatedPosts from "@/components/blog/RelatedPosts";
import AuthorSig from "@/components/blog/AuthorSig";
import { MatchkoiBanner } from "@/components/blog/MatchkoiBanner";
import {
  getAllPostsMeta,
  getPostBySlug,
  getPrevNextForSlug,
} from "@/lib/blog/mdx";

import "../blog.css";

/* =========================
   Types
========================= */
type Locale = "ja" | "en";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

/* =========================
   Utils
========================= */
function normalizeLocale(locale: string): Locale {
  return locale === "en" ? "en" : "ja";
}

/* =========================
   Static Params
========================= */
export async function generateStaticParams() {
  const locales: Locale[] = ["ja", "en"];
  const allParams: { locale: Locale; slug: string }[] = [];

  for (const locale of locales) {
    const posts = await getAllPostsMeta(locale);

    for (const p of posts) {
      allParams.push({ locale, slug: p.slug });
    }
  }

  return allParams;
}

/* =========================
   Metadata
========================= */
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);

  const t = await getTranslations({ locale, namespace: "BlogPost" });

  const post = await getPostBySlug(slug, locale);
  if (!post) {
    return { title: t("notFound") };
  }

  const { meta } = post;
  const baseUrl = "https://delvertrade.com";
  const path = `/blog/${meta.slug}`;

  return {
    title: `${meta.title} | ${t("siteTitle")}`,
    description: meta.description,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
languages: {
  ja: `${baseUrl}/ja${path}`,
  en: `${baseUrl}/en${path}`,
  "x-default": `${baseUrl}/ja${path}`,
},
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      url: `${baseUrl}/${locale}${path}`,
      images: meta.heroImage
        ? [{ url: `${baseUrl}${meta.heroImage}` }]
        : undefined,
    },
  };
}

/* =========================
   Page
========================= */
export default async function BlogPostPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);

  const t = await getTranslations({ locale, namespace: "BlogPost" });

  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const { meta, content } = post;
  const { prevSlug, nextSlug } = await getPrevNextForSlug(slug, locale);

  return (
    <main className="blog-root min-h-screen">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 lg:pt-16 lg:max-w-5xl">
        <div className="lg:grid lg:grid-cols-[1fr_256px] lg:gap-10 lg:items-start">
        <div>

        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-slate-400">
          <Link href="/">{t("home")}</Link>
        </nav>

        {/* Header */}
        <header className="mt-4 space-y-3">
          <p className="inline-flex items-center rounded-full bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-400">
            {meta.category}
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            {meta.title}
          </h1>

          <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px]">
            <div className="flex items-center">
              <span className="text-slate-400 font-medium mr-2">{t("by")}</span>
              <span className="text-slate-900 font-bold tracking-tight">
                {meta.author || t("defaultAuthor")}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 font-medium mr-2">{t("published")}</span>
              <time className="text-slate-600 font-semibold">
                {meta.publishedAt}
              </time>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 font-medium mr-2">{t("readTime")}</span>
              <span className="text-slate-600 font-semibold">
                {meta.readTimeMinutes} {t("minutes")}
              </span>
            </div>
          </div>

          <p className="mt-8 text-[17px] leading-relaxed text-slate-500 font-medium border-l-2 border-emerald-500 pl-6 py-1">
            {meta.description}
          </p>
        </header>

        {/* Hero */}
        {meta.heroImage && (
          <Image
            src={meta.heroImage}
            alt={meta.title}
            width={1200}
            height={630}
            className="mt-6 rounded-xl"
            priority
          />
        )}

        {/* マチコイ インライン広告（記事本文前） */}
        <MatchkoiBanner variant="inline" />

        {/* Body */}
        <article className="prose prose-neutral max-w-none mt-8 dark:prose-invert">
          {content}
        </article>

        {/* Pagination */}
        <div className="mt-12 flex justify-between text-sm font-medium">
          {prevSlug ? (
            <Link href={`/blog/${prevSlug}`} className="text-emerald-500 hover:underline">
              ← {t("prev")}
            </Link>
          ) : <span />}

          {nextSlug ? (
            <Link href={`/blog/${nextSlug}`} className="text-emerald-500 hover:underline">
              {t("next")} →
            </Link>
          ) : <span />}
        </div>

        {/* マチコイ 記事末尾広告 */}
        <MatchkoiBanner variant="end" />

        <AuthorSig />
        <RelatedPosts currentSlug={slug} locale={locale} />

        <BlogCta
          title={t("cta.title")}
          description={t("cta.description")}
          buttonLabel={t("cta.button")}
          href="/app"
        />
        </div>

        {/* サイドバー広告（PC のみ） */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <MatchkoiBanner variant="sidebar" />
          </div>
        </aside>
        </div>
      </div>
    </main>
  );
}
