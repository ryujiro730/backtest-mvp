"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

type StepItem = { title: string; description: string };

export default function Explanation() {
  const t = useTranslations("Explanation");
  const steps = t.raw("steps") as StepItem[];

  const howToJsonLd = useMemo(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: t("title"),
      description: t("description"),
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.description,
      })),
    };
    return JSON.stringify(data).replace(/<\/script>/gi, "<\\/script>");
  }, [t, steps]);

  if (!steps?.length) return null;

  return (
    <section
      className="py-16 md:py-20 border-b border-slate-200/60 bg-slate-50/50"
      aria-labelledby="explanation-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: howToJsonLd }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2
          id="explanation-heading"
          className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight"
        >
          {t("title")}
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          {t("description")}
        </p>

        <ol
          className="mt-10 space-y-8"
          role="list"
          aria-label={t("title")}
        >
          {steps.map((step, index) => (
            <li key={index} className="relative flex gap-6">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-sm font-semibold text-indigo-600 shadow-sm"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  STEP {index + 1}: {step.title}
                </h3>
                <p className="mt-2 text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
