// components/blog/RelatedPosts.tsx
import Link from "next/link";
import { getAllPostsMeta, BlogMeta } from "@/lib/blog/mdx";

export default async function RelatedPosts({
  currentSlug,
  locale,
}: {
  currentSlug: string;
  locale: "ja" | "en";
}) {
  const allPosts = await getAllPostsMeta(locale);



  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-24 border-t border-slate-200 pt-16 pb-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-slate-900 font-serif text-center">
          Related Topics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {relatedPosts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`} 
              className="group flex flex-col"
            >
              {/* アイキャッチ代わりのビジュアル */}
              <div className="aspect-[16/9] w-full bg-slate-900 rounded-lg mb-4 flex items-center justify-center p-6 overflow-hidden relative transition-all group-hover:shadow-2xl group-hover:shadow-slate-200">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-50" />
                <span className="relative z-10 text-slate-300 text-[10px] uppercase tracking-[0.2em] font-bold">
                  {post.category || "Insight"}
                </span>
                {/* 装飾的なライン（Bスタイルっぽさ） */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-500 group-hover:w-full" />
              </div>

              <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                {post.title}
              </h3>
              
              <p className="mt-2 text-sm text-slate-500 line-clamp-2 italic">
                {post.description}
              </p>
              
              <div className="mt-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                READ MORE 
                <svg className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}