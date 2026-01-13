"use client";

import { LogicToggle } from "./LogicToggle";

type Logic = "AND" | "OR";

export function SectionHeader({ title, logic, onChangeLogic }) {
  return (
    <div className="flex items-center w-full">
      <span className="font-semibold">{title}</span>

      {logic && onChangeLogic && (
        <div className="ml-auto">
          <LogicToggle value={logic} onChange={onChangeLogic} />
        </div>
      )}
    </div>
  );
}
