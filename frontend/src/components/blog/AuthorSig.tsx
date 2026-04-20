"use client";

import Image from "next/image";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const PERSON_IMAGE = "https://tsujiryujiro.com/AuthorSig/ryujiro.jpg";
// SNSリンク先が本名アカウントなら、ここも変更するかコメントアウトを推奨
const GITHUB_URL = "https://github.com/ryujiro730"; 
const X_URL = "https://x.com/_teejey";
const SAME_AS = [X_URL, GITHUB_URL] as const;

export default function AuthorSig() {
  const t = useTranslations("AuthorSig");

  const jsonLd = useMemo(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "辻 龍次朗",
      alternateName: "Ryujiro Tsuji",
      image: PERSON_IMAGE,
      sameAs: [...SAME_AS],
      description: t("description"),
    };
    return JSON.stringify(data).replace(
      /<\/script>/gi,
      "<\\/script>"
    );
  }, [t]);

  return (
    <aside
      className="mt-16 border-y border-slate-200 py-10"
      itemScope
      itemType="https://schema.org/Person"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Profile Image */}
        <div className="relative group">
          <div className="h-16 w-16 rounded-full border border-slate-200 overflow-hidden transition-all group-hover:border-emerald-500">
            <Image
              src="/AuthorSig/ryujiro.jpg"
              alt={t("imageAlt")}
              width={64}
              height={64}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              itemProp="image"
            />
          </div>

          {/* Online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">
              {t("label")}
            </span>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight" itemProp="name">
              {t("nameJa")}
              <span className="text-sm font-normal text-slate-400 ml-2">
                {t("nameEn")}
              </span>
            </h3>
          </div>

          <p
            className="mt-3 text-[15px] leading-relaxed text-slate-600 max-w-2xl font-sans"
            itemProp="description"
          >
            {t("description")}
          </p>

          <div className="mt-6 flex items-center gap-6 flex-wrap">
            {/* SNSリンク先が本名なら、受給期間中はここを非表示にするのも手です */}
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              itemProp="sameAs"
              className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              itemProp="sameAs"
              className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              aria-label="X (Twitter)"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}