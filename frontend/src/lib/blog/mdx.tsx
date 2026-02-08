// src/lib/blog/mdx.tsx
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import Image from "next/image";
import { NextLink } from "@/components/blog/NextLink";
import { BlogCta } from "@/components/blog/BlogCta";
import BlogToc from "@/components/blog/BlogToc";
import { InlineLink } from "@/components/blog/InlineLink";
import remarkBreaks from "remark-breaks";
import { cache } from "react";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ValidationCode } from "@/components/blog/ValidationCode";

// 基底ディレクトリは src/content/blog
const BLOG_ROOT = path.join(process.cwd(), "src", "content", "blog");

const mdxComponents = {
  NextLink,
  Image,
  BlogCta,
  BlogToc,
  InlineLink,
  ValidationCode,
};

export type BlogMeta = {
  slug: string;
  categorySlug: string;
  sourcePath: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTimeMinutes: number;
  heroImage?: string;
  next?: string | null;
  prev?: string | null;
  author?: string;
};

export type BlogPost = {
  meta: BlogMeta;
  content: React.ReactNode;
};

async function collectMdxFiles(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) return [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectMdxFiles(fullPath)));
    else if (entry.isFile() && entry.name.endsWith(".mdx")) files.push(fullPath);
  }
  return files;
}

/**
 * 言語ごとにインデックスを生成するように cache を調整
 */
const buildIndex = async (locale: "ja" | "en") => {
  if (!locale) {
    throw new Error("buildIndex called with undefined locale");
  }
  const targetDir = path.join(BLOG_ROOT, locale);
  const filePaths = await collectMdxFiles(targetDir);

  const metas = await Promise.all(
    filePaths.map(async (fullPath) => {
      const fileSlug = path.basename(fullPath, ".mdx");
      const source = await fs.promises.readFile(fullPath, "utf8");

      const { frontmatter } = await compileMDX<Partial<BlogMeta>>({
        source,
        options: {
          parseFrontmatter: true,
          mdxOptions: { remarkPlugins: [remarkBreaks] },
        },
      });

      const urlSlug = fileSlug; // 強制

      return {
        ...(frontmatter as any),
        slug: urlSlug,
        sourcePath: fullPath,
        title: (frontmatter as any)?.title ?? urlSlug,
        description: (frontmatter as any)?.description ?? "",
        category: (frontmatter as any)?.category ?? "",
        publishedAt: (frontmatter as any)?.publishedAt ?? "",
        readTimeMinutes: (frontmatter as any)?.readTimeMinutes ?? 0,
        heroImage: (frontmatter as any)?.heroImage,
        author: (frontmatter as any)?.author ?? "David Miller",
      } satisfies BlogMeta;
    })
  );

  const all = metas.sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );

  return { all };
};

/**
 * 指定した言語の全記事メタデータを取得
 */
export const getAllPostsMeta = cache(
  async (locale: "ja" | "en") => {
    const { all } = await buildIndex(locale);
    return all;
  }
);


export async function getPost(source: string) {
  return compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
      },
    },
  });
}

/**
 * 言語とスラッグから特定の記事を取得
 */
export const getPostBySlug = async (slug: string, locale: "ja" | "en") => {
  // 言語フォルダ（ja/en）の中を探す
  const file = path.join(BLOG_ROOT, locale, `${slug}.mdx`);
  
  try {
    await fs.promises.access(file);
  } catch {
    // フォルダ直下にない場合、サブフォルダも一応探す（旧構成互換）
    const all = await getAllPostsMeta(locale);
    const found = all.find(m => m.slug === slug);
    if (!found) return null;
    return getPostByFullPath(found.sourcePath, slug);
  }

  return getPostByFullPath(file, slug);
};

async function getPostByFullPath(filePath: string, slug: string) {
  const source = await fs.promises.readFile(filePath, "utf8");
  const { frontmatter, content } = await compileMDX({
    source,
    options: { 
      parseFrontmatter: true,
      mdxOptions: { remarkPlugins: [remarkBreaks] },
    },
    components: mdxComponents,
  });

  return {
    meta: {
      ...(frontmatter as any),
      slug,
      sourcePath: filePath,
    },
    content,
  };
}

/**
 * 前後の記事取得も言語を考慮
 */
export async function getPrevNextForSlug(
  slug: string,
  locale: "ja" | "en"
)
: Promise<{
  prevSlug: string | null;
  nextSlug: string | null;
}> {
  const all = await getAllPostsMeta(locale);
  const sorted = [...all].sort(
    (a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt)
  );

  const idx = sorted.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prevSlug: null, nextSlug: null };

  return {
    prevSlug: sorted[idx - 1]?.slug ?? null,
    nextSlug: sorted[idx + 1]?.slug ?? null,
  };
}