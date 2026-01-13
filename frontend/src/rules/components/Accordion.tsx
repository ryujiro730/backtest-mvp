"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AccordionProps = {
  header: React.ReactNode;
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function Accordion({
  header,
  enabled,
  onToggleEnabled,
  defaultOpen = true,
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b">
        {/* 左：Enable */}
        <label className="inline-flex items-center cursor-pointer mr-4 flex-shrink-0">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`relative w-10 h-5 rounded-full transition ${
              enabled ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-5" : ""
              }`}
            />
          </div>
        </label>

        {/* 中央：Header（ここが全幅を持つ） */}
        <div className="flex-1 min-w-0">
          {header}
        </div>

        {/* 右：Chevron */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="p-1 rounded hover:bg-gray-100 ml-4 flex-shrink-0"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Body */}
  {open && (
    <div
      className={`px-6 py-6 ${
        enabled ? "" : "opacity-50 pointer-events-none"
      }`}
    >
      {children}
    </div>
      )}
    </div>
  );
}
