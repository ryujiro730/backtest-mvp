// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPostsMeta } from '@/lib/blog/mdx';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://delvertrade.com';
  const locales = ['ja', 'en'];

  // --- 固定ページのリスト (lastModified はページファイルの最終 git コミット日) ---
  const staticPaths: { path: string; lastModified: string }[] = [
    { path: '',                        lastModified: '2026-02-13' },
    { path: '/blog',                   lastModified: '2026-03-18' },
    { path: '/tools/risk-of-ruin',     lastModified: '2026-02-07' },
    { path: '/tools/expected-value',   lastModified: '2026-02-07' },
    { path: '/signup',                 lastModified: '2026-03-18' },
    { path: '/login',                  lastModified: '2026-03-18' },
  ];

  // --- 1. 固定ページの生成 (ja と en 両方作る) ---
  const staticEntries = staticPaths.flatMap(({ path, lastModified }) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(lastModified),
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