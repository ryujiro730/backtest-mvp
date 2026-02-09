"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

function NoticeCard() {
  const t = useTranslations("Notice");
  const [open, setOpen] = useState(false);

  // PC では初回表示で開く。スマホは閉じたまま（邪魔にならない）
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) setOpen(true);
  }, []);

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        backgroundColor: "#fff8d6",
        border: "1px solid #f6d66c",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left hover:opacity-90 transition-opacity"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold" style={{ color: "#b7791f" }}>
          ⚠ {t("title")}
        </span>
        <span className="flex items-center gap-1 shrink-0 text-xs" style={{ color: "#b7791f" }}>
          <span className="hidden sm:inline">{open ? t("tapToCollapse") : t("tapToExpand")}</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="px-4 pb-4 text-xs space-y-2" style={{ color: "#7b4f0b" }}>
            <li>{t.rich("items.backtest", { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich("items.timeframe", { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich("items.engine", { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich("items.free", { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich("items.contact", { strong: (c) => <strong>{c}</strong> })}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NoticeCard;
