// src/components/blog/BlogCta.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react"; // アイコンのインポート

type BlogCtaProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
};

export function BlogCta({
  title,
  description,
  buttonLabel,
  href,
}: BlogCtaProps) {
  return (
    <Card className="not-prose mt-16 overflow-hidden border-slate-200 bg-slate-50 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          
          {/* テキストエリア: 余白を十分に取る */}
          <div className="p-8 md:p-10 md:pr-4">
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              {title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {description}
            </p>
          </div>

          {/* CTAエリア: スマホでは下部に、PCでは右側に配置 */}
          <div className="bg-white p-6 md:bg-transparent md:p-10 md:pl-0">
            <Link
              href={href}
              className="
                group
                relative
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-blue-600
                px-8
                py-4
                text-base
                font-bold
                text-white
                shadow-md
                transition-all
                hover:-translate-y-0.5
                hover:bg-blue-700
                hover:shadow-lg
                md:w-auto
                md:min-w-[240px]
              "
            >
              {buttonLabel}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            {/* マイクロコピー（補足）が必要ならここに追加可能 */}
            <p className="mt-3 text-center text-xs text-slate-400 md:hidden">
              タップして詳細を確認
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}