"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export default function BlogToc() {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // article 内の h2 を対象（MDX構造変更に強い）
    const headings = Array.from(
      document.querySelectorAll("article h2")
    ) as HTMLHeadingElement[];

    const list = headings.map((h) => {
      let id = h.id;

      // id がなければ生成
      if (!id) {
        id = h.innerText
          .trim()
          .toLowerCase()
          .replace(/[。\s・、]/g, "-")
          .replace(/[^a-z0-9\-ぁ-んァ-ン一-龥]/g, "");
        h.id = id;
      }

      return {
        id,
        text: h.innerText,
        level: 2,
      };
    });

    setToc(list);
  }, []);

  // h2 がなければ何も出さない（白箱防止）
  if (toc.length === 0) return null;

  return (
    <div className="my-10">
      {/* PC版 */}
      <div className="hidden md:block">
        <TocCard toc={toc} title="TOC" />
      </div>

      {/* モバイル版 */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="
            w-full
            bg-white
            border border-slate-200
            rounded-xl
            px-4 py-3
            shadow-sm
            flex justify-between items-center
          "
        >
          <span className="font-semibold text-slate-800">目次</span>
          <span className="text-slate-500">{open ? "▲" : "▼"}</span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <TocCard toc={toc} isMobile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =========================
   目次カード
   ========================= */

function TocCard({
  toc,
  title,
  isMobile,
}: {
  toc: TocItem[];
  title?: string;
  isMobile?: boolean;
}) {
  return (
    <div
      className={`
        bg-white
        border border-slate-200
        shadow-sm
        p-5
        rounded-xl
        ${isMobile ? "mt-2" : ""}
      `}
    >
      {title && (
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          {title}
        </h3>
      )}

      <ul className="space-y-2 border-l border-slate-200 pl-4">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="
                block
                font-medium
                text-slate-700
                hover:text-blue-700
                hover:underline
                underline-offset-4
                transition
              "
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
