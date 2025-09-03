// app/[locale]/blog/page.tsx  ← サーバーコンポーネント（"use client" 付けない）
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

type PostMeta = {
  title: string;
  date: string;        // "2025-09-01" など
  excerpt?: string;
  cover?: string;
};

export default function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // 記事ディレクトリ: content/blog/{locale}
  const dir = path.join(process.cwd(), "content", "blog", locale);

  // フォルダが無くても落ちないように
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
    : [];

  const posts = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ""),
        ...(data as PostMeta),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Delver Blog</h1>

      {posts.length === 0 ? (
        <p className="text-zinc-400">No posts yet.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/${locale}/blog/${post.slug}`}>
              <div className="card hover:shadow-lg transition">
                <div className="p-6">
                  <p className="text-sm text-emerald-400">{post.date}</p>
                  <h2 className="text-xl font-semibold mt-2">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-zinc-400 mt-2">{post.excerpt}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
