"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

/**
 * TradingConditions と Exit で共通。単位付き数値入力。
 * フォーカス中は文字列のまま受け付け（小数点入力可能）、blur で親に文字列を渡す。
 */
export function UnitInput({
  label,
  unit,
  placeholder,
  value,
  onChange,
  className,
}: {
  label?: string;
  unit: string;
  placeholder?: string;
  value: number | string | null;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  const [localStr, setLocalStr] = React.useState("");

  const displayValue = focused
    ? localStr
    : (value === null || value === "" ? "" : String(value));

  const handleBlur = () => {
    setFocused(false);
    onChange(localStr);
  };

  return (
    <div className={className ?? "space-y-2"}>
      {label != null && (
        <label className="text-sm font-medium block">{label}</label>
      )}
      <div className="relative">
        <Input
          type="text"
          inputMode="decimal"
          className="pr-14 min-w-[6ch]"
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => {
            setFocused(true);
            setLocalStr(
              value === null || value === "" ? "" : String(value)
            );
          }}
          onBlur={handleBlur}
          onChange={(e) => {
            if (focused) setLocalStr(e.target.value);
            else onChange(e.target.value);
          }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}
