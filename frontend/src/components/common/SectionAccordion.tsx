"use client";

import { useRef, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type SectionAccordionProps = {
  id: string;
  title: string;
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
  /** false にすると input/change で自動 ON にしない（Exit など入力のたびに update すると不具合になるセクション用） */
  listenToInput?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionAccordion({
  id,
  title,
  enabled,
  onToggleEnabled,
  listenToInput = true,
  headerRight,
  children,
}: SectionAccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // セクション内で入力・変更があったらチェックを自動でONにする（listenToInput が false のときは行わない）
  useEffect(() => {
    if (!listenToInput) return;
    const el = contentRef.current;
    if (!el) return;
    const handleInteraction = () => onToggleEnabled(true);
    el.addEventListener("input", handleInteraction);
    el.addEventListener("change", handleInteraction);
    return () => {
      el.removeEventListener("input", handleInteraction);
      el.removeEventListener("change", handleInteraction);
    };
  }, [listenToInput, onToggleEnabled]);

  return (
    <Card className="rounded-xl border border-slate-200/80 shadow-sm">
      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value={id} className="border-none">

          {/* Header：チェックはアウトライン＋Delverブルーで控えめに */}
          <div className="flex items-center px-5 py-4 gap-3">
            <Checkbox
              checked={enabled}
              onCheckedChange={(v) => onToggleEnabled(!!v)}
              className="h-4 w-4 rounded border-2 border-slate-300 data-[state=checked]:bg-transparent data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-600 data-[state=checked]:shadow-none"
            />

            {/* タイトル */}
            <div
              className={`flex-1 font-semibold ${
                enabled ? "" : "text-muted-foreground"
              }`}
            >
              {title}
            </div>

            {headerRight}

            {/* 開閉トリガー */}
            <AccordionTrigger className="p-0 hover:no-underline" />
          </div>

          {/* Body：チェックなしでも入力可能。入力時に自動でチェックが入る */}
          <AccordionContent>
            <div
              ref={contentRef}
              className={`px-5 pb-5 ${enabled ? "" : "opacity-70"}`}
            >
              {children}
            </div>
          </AccordionContent>

        </AccordionItem>
      </Accordion>
    </Card>
  );
}
