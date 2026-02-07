"use client";

import { useTranslations } from "next-intl";

function NoticeCard() {
  const t = useTranslations("Notice");

  return (
    <div
      className="rounded-md p-4"
      style={{
        backgroundColor: "#fff8d6",
        border: "1px solid #f6d66c",
      }}
    >
      <h2 className="text-sm font-semibold" style={{ color: "#b7791f" }}>
        ⚠ {t("title")}
      </h2>

      <ul className="mt-2 text-xs space-y-2" style={{ color: "#7b4f0b" }}>
        <li>{t.rich("items.backtest", { strong: (c) => <strong>{c}</strong> })}</li>

        <li>{t.rich("items.timeframe", { strong: (c) => <strong>{c}</strong> })}</li>

        <li>{t.rich("items.engine", { strong: (c) => <strong>{c}</strong> })}</li>

        <li>{t.rich("items.free", { strong: (c) => <strong>{c}</strong> })}</li>

        <li>{t.rich("items.contact", { strong: (c) => <strong>{c}</strong> })}</li>
      </ul>
    </div>
  );
}

export default NoticeCard;
