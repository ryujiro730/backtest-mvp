'use client';
import React from "react";

export function NumberField(props: { value: number; onChange: (n: number) => void; integer?: boolean; className?: string; min?: number; max?: number; disabled?: boolean; }) {
  const { value, onChange, integer, className, min, max, disabled } = props;
  const [raw, setRaw] = React.useState(String(value));
  React.useEffect(() => setRaw(String(value)), [value]);
  return (
    <input
      type="text" className={className} disabled={disabled}
      inputMode={integer ? "numeric" : "decimal"}
      pattern={integer ? "[0-9]*" : "[0-9]*[.]?[0-9]*"}
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={() => {
        if (raw.trim() === "") { setRaw(String(value)); return; }
        let n = Number(raw); if (!Number.isFinite(n)) { setRaw(String(value)); return; }
        if (integer) n = Math.floor(n);
        if (typeof min === "number") n = Math.max(min, n);
        if (typeof max === "number") n = Math.min(max, n);
        onChange(n); setRaw(String(n));
      }}
    />
  );
}
