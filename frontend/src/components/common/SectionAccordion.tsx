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
    <Card>
      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value={id} className="border-none">

          {/* Header */}
          <div className="flex items-center px-6 py-4 gap-3">
            {/* Checkbox：条件ON/OFF */}
            <Checkbox
              checked={enabled}
              onCheckedChange={(v) => onToggleEnabled(!!v)}
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
              className={`px-6 pb-6 ${enabled ? "" : "opacity-70"}`}
            >
              {children}
            </div>
          </AccordionContent>

        </AccordionItem>
      </Accordion>
    </Card>
  );
}
