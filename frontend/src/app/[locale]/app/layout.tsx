// app/(product)/layout.tsx
export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      {children}
    </div>
  );
}
