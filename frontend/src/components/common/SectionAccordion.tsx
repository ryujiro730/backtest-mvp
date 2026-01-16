"use client";

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
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionAccordion({
  id,
  title,
  enabled,
  onToggleEnabled,
  headerRight,
  children,
}: SectionAccordionProps) {
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

          {/* Body */}
          <AccordionContent>
            <div
              className={`px-6 pb-6 ${
                enabled ? "" : "opacity-50 pointer-events-none"
              }`}
            >
              {children}
            </div>
          </AccordionContent>

        </AccordionItem>
      </Accordion>
    </Card>
  );
}
