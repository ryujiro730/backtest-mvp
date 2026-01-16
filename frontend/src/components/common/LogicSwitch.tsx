"use client";

import { Switch } from "@/components/ui/switch";

type Logic = "AND" | "OR";

export function LogicSwitch({
  value,
  onChange,
}: {
  value: Logic;
  onChange: (v: Logic) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        {value === "AND" ? "すべて満たす" : "いずれか"}
      </span>
      <Switch
        checked={value === "AND"}
        onCheckedChange={(v) => onChange(v ? "AND" : "OR")}
      />
      <span className="font-medium">{value}</span>
    </div>
  );
}
