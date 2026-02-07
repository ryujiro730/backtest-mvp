// components/common/MaskedDateInput.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

export function MaskedDateInput({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  const [raw, setRaw] = React.useState(toRaw(value));

  React.useEffect(() => {
    setRaw(toRaw(value));
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={format(raw)}
      onChange={(e) => {
        const next = e.target.value.replace(/\D/g, "").slice(0, 8);
        setRaw(next);
        if (next.length === 8) {
          const d = parse(next);
          if (d) onChange(d);
        }
      }}
      className="w-[140px] text-center tracking-widest"
    />
  );
}

function toRaw(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function format(raw: string) {
  if (raw.length <= 4) return raw;
  if (raw.length <= 6) return `${raw.slice(0, 4)}/${raw.slice(4)}`;
  return `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6)}`;
}
function parse(raw: string): Date | null {
  const y = +raw.slice(0, 4);
  const m = +raw.slice(4, 6) - 1;
  const d = +raw.slice(6, 8);
  const date = new Date(y, m, d);
  return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d
    ? date
    : null;
}
