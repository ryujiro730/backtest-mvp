import type { Metadata } from "next";

// 動的に messages を読み込む（next-intl なしの軽量方式）
async function getMessages(locale: string) {
  switch (locale) {
    case "ja":
      return (await import("./messages/ja.json")).default as any;
    default:
      return (await import("./messages/en.json")).default as any;
  }
}

type TermsSection = { h: string; p: string };

export const metadata: Metadata = {
  title: "Terms of Service | Delver",
  description:
    "Delver (FX backtest tool) Terms of Service. Stripe subscription billing, disclaimers, cancellation, and more.",
};

export default async function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const dict = await getMessages(locale);

  const title: string = dict?.terms?.title ?? "Terms of Service";
  const lastUpdated: string = dict?.terms?.lastUpdated ?? "";
  const sections: TermsSection[] = dict?.terms?.sections ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {lastUpdated && (
          <p className="mt-2 text-sm text-gray-500">{lastUpdated}</p>
        )}
      </header>

      <article className="prose prose-neutral max-w-none">
        {sections.map((s, i) => (
          <section key={i} className="mb-6">
            <h2 className="text-xl font-semibold">{s.h}</h2>
            <p className="mt-2 leading-7">{s.p}</p>
          </section>
        ))}
      </article>
    </main>
  );
}

