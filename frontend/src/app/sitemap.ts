// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/blog/mdx';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://delvertrade.com';
  const locales = ['ja', 'en'];

  // --- 固定ページのリスト ---
  const staticPaths = ['', '/blog', '/tools/risk-of-ruin', '/tools/expected-value', '/signup', '/login'];

  // --- 1. 固定ページの生成 (ja と en 両方作る) ---
  const staticEntries = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
      },
    }))
  );

  // --- 2. ブログ記事の生成 (ja と en 両方作る) ---
  const blogEntries: MetadataRoute.Sitemap = [];
  
  for (const locale of locales) {
    const posts = await getAllPostsMeta(locale);
    for (const post of posts) {
      const path = `/blog/${post.slug}`;
      blogEntries.push({
        url: `${base}/${locale}${path}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
        },
      });
    }
  }

  return [...staticEntries, ...blogEntries];
}