import { items, type Tab } from "@/components/PerformanceSidebar";

export function PerformanceTabsMobile({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="md:hidden sticky top-0 z-10 bg-background border-b">
      <div className="flex overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap
              ${
                current === item.id
                  ? "border-b-2 border-primary font-medium"
                  : "text-muted-foreground"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
