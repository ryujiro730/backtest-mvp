// src/lib/blog.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import readingTime from "reading-time";

const coerceDateYYYYMMDD = z.preprocess((v) => {
  if (v instanceof Date) {
    // YAMLがDateに解釈した場合
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string") return v;
  return v;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

export const Frontmatter = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().min(1, "description is required"),
  date: coerceDateYYYYMMDD,                 // ← Dateでも文字列でも受ける
  category: z.string().min(1),
  categoryLabel: z.string().optional(),
  tags: z.preprocess((v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      return v.split(",").map(s => s.trim()).filter(Boolean); // "a, b" を配列へ
    }
    return [];
  }, z.array(z.string())),
  og: z.string().optional(),
  hero: z.string().optional(),
  canonical: z.string().optional(),
  updated: coerceDateYYYYMMDD.optional(),
  noindex: z.coerce.boolean().optional(),   // "true"/"false" もOKに
});

export type FrontmatterT = z.infer<typeof Frontmatter>;

const CONTENT_ROOT = path.join(process.cwd(), "src/content/blog");

export function getPostSource(locale: "ja" | "en", slug: string) {
  const file = path.join(CONTENT_ROOT, locale, `${slug}.mdx`);
const raw0 = fs.readFileSync(file, "utf8");
let raw = raw0
  .replace(/^\uFEFF/, "")
  .replace(/^[\u200B-\u200D\u2060\u00A0\u3000]+/, "");

// 先頭の 3 本ダッシュを ASCII に正規化（念のため）
raw = raw.replace(/^[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE63\uFF0D\-]{3}/, '---');

const start = raw.indexOf('---\n');            // 開き候補
const closeRegex = /\n---\s*\n/;               // 標準の閉じ
const closeMatch = closeRegex.exec(raw);
const close = closeMatch ? closeMatch.index : -1;

console.log('[FM]', { file, start, close });
console.log(raw.slice(0, 200));                // 先頭200文字確認

const { content, data } = matter(raw);  // ← これで拾える


  const parsedRes = Frontmatter.safeParse(data);
  if (!parsedRes.success) {
    const issues = parsedRes.error.issues
      .map(i => `- ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    // ファイル名付きで即特定できるように
    throw new Error(`Frontmatter error in ${locale}/${slug}.mdx\n${issues}`);
  }
const parsed = Frontmatter.parse(data);

  const rt = readingTime(content);
  return {
    content,
    data: parsed,
    readingTime: rt,
    meta: {
      readingMinutes: Math.max(1, Math.round(rt.minutes)),
      wordCount: rt.words,
      slug,
      locale,
      urlPath: `/${locale}/blog/${slug}`,
    },
  };
}

export function listAllPosts(locale: "ja" | "en") {
  const dir = path.join(CONTENT_ROOT, locale);
  const slugs = fs.readdirSync(dir).filter(f => f.endsWith(".mdx")).map(f => f.replace(/\.mdx$/, ""));
  return slugs
    .map(slug => {
      const { data, meta } = getPostSource(locale, slug);
      return { slug, data, meta };
    })
    .sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}
