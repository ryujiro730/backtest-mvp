// components/common/PeriodSelector.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MaskedDateInput } from "./MaskedDateInput";

const PRESETS = [
  { key: "1Y", label: "過去1年", years: 1 },
  { key: "3Y", label: "過去3年", years: 3 },
  { key: "5Y", label: "過去5年", years: 5 },
  { key: "10Y", label: "過去10年", years: 10 },
  { key: "ALL", label: "全期間" },
];

export function PeriodSelector({
  value,
  onApply,
  dataMin,
  dataMax,
}: {
  value: { from: Date; to: Date };
  onApply: (v: { from: Date; to: Date; preset?: string }) => void;
  dataMin: Date;
  dataMax: Date;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [preset, setPreset] = React.useState<string | undefined>();

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    if (p.key === "ALL") {
      setDraft({ from: dataMin, to: dataMax });
      setPreset("ALL");
      return;
    }
    const to = dataMax;
    const from = new Date(to);
    from.setFullYear(to.getFullYear() - (p.years ?? 0));
    setDraft({ from, to });
    setPreset(p.key);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {preset ? PRESETS.find(p => p.key === preset)?.label : "カスタム"}　
          {fmt(value.from)}〜{fmt(value.to)}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px]">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                variant={preset === p.key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">カスタム</div>
            <MaskedDateInput
              value={draft.from}
              onChange={(d) => {
                setDraft({ ...draft, from: d });
                setPreset(undefined);
              }}
            />
            <MaskedDateInput
              value={draft.to}
              onChange={(d) => {
                setDraft({ ...draft, to: d });
                setPreset(undefined);
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              onApply({ ...draft, preset });
              setOpen(false);
            }}
          >
            適用
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function fmt(d: Date) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
