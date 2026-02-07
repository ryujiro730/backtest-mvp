"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  value: number;            // 0〜1
  onChange: (v: number) => void;
  min?: number;             // %
  max?: number;             // %
  step?: number;
};

export function PercentInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: Props) {
  const [text, setText] = useState<string>(() => String(Math.round(value * 100)));
  const ref = useRef<HTMLInputElement>(null);

  // 外部変更同期
  useEffect(() => {
    setText(String(Math.round(value * 100)));
  }, [value]);

  const commit = () => {
    if (text === "") {
      setText("0");
      onChange(0);
      return;
    }

    const num = Number(text);
    if (Number.isNaN(num)) return;

    const clamped = Math.min(max, Math.max(min, num));
    setText(String(clamped));
    onChange(clamped / 100);
  };

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={text}
        onChange={(e) => {
          // 数字以外拒否
          const v = e.target.value.replace(/[^\d]/g, "");
          setText(v);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        onFocus={(e) => {
          // 全選択
          e.currentTarget.select();
        }}
        placeholder="0"
      />
      <div className="text-xs text-muted-foreground">
        {min}% 〜 {max}%
      </div>
    </div>
  );
}
