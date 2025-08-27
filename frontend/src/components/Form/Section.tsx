import React from "react";
export default function Section({ title, children }:{title:string; children:React.ReactNode}) {
  return (
    <div className="rounded-2xl p-4 border mb-4 shadow-sm">
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

