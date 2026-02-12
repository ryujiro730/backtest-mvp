// src/app/tools/risk-of-ruin/layout.tsx
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "#F5F7FA" }}>
      <Header variant="light" transparent={false} />
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
