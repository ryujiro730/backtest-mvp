// src/app/tools/risk-of-ruin/layout.tsx
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header variant="light" transparent={false} />
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
