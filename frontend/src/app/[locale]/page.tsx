import LPPageContent, { LP_META } from "@/components/lp/LPPageContent";
import { Metadata } from "next";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = LP_META[locale === "en" ? "en" : "ja"];
  return {
    title: meta.title,
    description: meta.description,
    robots: "index, follow",
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LPPageContent locale={locale} />;
}
