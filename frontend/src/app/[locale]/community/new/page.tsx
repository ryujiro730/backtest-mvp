import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import CommunityNewForm from "./CommunityNewForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CommunityNewPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Community" });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 lg:py-16">
      <div className="mb-8">
        <Link
          href="/community"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← {t("backToList")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {t("newPost")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t("newPostDescription")}</p>
      </div>

      <CommunityNewForm locale={locale} />
    </main>
  );
}
