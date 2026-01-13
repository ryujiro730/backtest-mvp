// src/components/blog/TOC.tsx
export default function TOC({ items }: { items: {depth:2|3; text:string; id:string}[] }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="目次" className="text-sm">
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.id} className={it.depth === 3 ? "ml-4" : ""}>
            <a href={`#${it.id}`} className="text-zinc-600 hover:text-zinc-900">{it.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
