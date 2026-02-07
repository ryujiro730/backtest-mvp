// app/[locale]/tools/risk-of-ruin/page.tsx
import BalsaraClient from "./BalsaraClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // ← 必須

  const messages =
    locale === "ja"
      ? (await import("@/messages/ja.json")).default
      : (await import("@/messages/en.json")).default;

  const meta = messages.Balsara.Metadata;

  return {
    title: meta.title,
    description: meta.description,
  };
}


export default function Page() {
  return <BalsaraClient />;
}