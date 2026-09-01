// app/blog/layout.tsx
import "./blog.css";
import Header from "@/components/layout/Header";
import { MatchkoiFloatingBanner } from "@/components/blog/MatchkoiFloatingBanner";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="blog-scope min-h-screen bg-slate-50 text-slate-900">
      <Header variant="light" transparent={false} />
      {children}
      <MatchkoiFloatingBanner />
    </div>
  );
}
