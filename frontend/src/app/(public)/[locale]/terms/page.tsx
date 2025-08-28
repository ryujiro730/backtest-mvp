// src/app/(public)/[locale]/terms/page.tsx
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {MDXRemote} from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkAutolinkHeadings from "remark-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

type Params = { locale: "ja" | "en" };

export async function generateStaticParams() {
  return [{locale: "ja"}, {locale: "en"}]; // 事前生成
}

export default async function TermsPage({params}: {params: Params}) {
  const file = path.join(process.cwd(), "src/content/terms", `${params.locale}.md`);
  const raw = await fs.readFile(file, "utf-8");
  const {content, data} = matter(raw); // frontmatter抽出

  const title = (data.title as string) ?? (params.locale === "ja" ? "利用規約" : "Terms of Service");
  const lastUpdated = data.lastUpdated as string | undefined;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {lastUpdated && (
          <p className="mt-2 text-sm text-zinc-400">
            {params.locale === "ja" ? "最終更新日:" : "Last Updated:"} {lastUpdated}
          </p>
        )}
      </header>

      <article className="prose prose-invert max-w-none">
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [
                remarkGfm,
                remarkSlug,
                [remarkAutolinkHeadings, {behavior: "wrap"}],
              ],
              rehypePlugins: [
                [rehypePrettyCode, {theme: "one-dark-pro"}],
              ],
            },
          }}
        />
      </article>
    </main>
  );
}
