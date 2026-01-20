// frontend/src/app/app/layout.tsx
import "./app.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="delver-app min-h-screen bg-gray-50 text-slate-900">{children}</div>;
}
