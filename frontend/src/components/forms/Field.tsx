'use client';
import React from "react";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </label>
  );
}
