import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export default function PostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const filePath = path.join(
    process.cwd(),
    "content",
    "blog",
    locale,
    `${slug}.md`
  );

  if (!fs.existsSync(filePath)) {
    // 404 風に
    return <div className="p-6">Not Found</div>;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return (
    <main className="container mx-auto px-6 py-12 prose prose-invert">
      <h1>{data.title}</h1>
      <p className="text-sm text-zinc-400">{data.date}</p>
      <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </main>
  );
}
