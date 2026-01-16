"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        {children}
      </div>
    </SidebarProvider>
  );
}
