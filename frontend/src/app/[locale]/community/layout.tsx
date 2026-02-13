import Header from "@/components/layout/Header";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header variant="light" transparent={false} />
      {children}
    </div>
  );
}
