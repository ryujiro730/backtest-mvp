'use client';
import { useEffect, useState } from "react";
import type { Catalog } from "@/src/features/run/types";

const API = process.env.NEXT_PUBLIC_API_BASE!;

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>({ pairs: [], timeframes: [], items: [] });
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/catalog`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`GET /api/catalog ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCatalog({
          pairs: Array.isArray(data?.pairs) ? data.pairs : [],
          timeframes: Array.isArray(data?.timeframes) ? data.timeframes : [],
          items: Array.isArray(data?.items) ? data.items : [],
        });
      } catch (e: any) {
        if (!cancelled) {
          setCatalog({ pairs: [], timeframes: [], items: [] });
          setCatalogError(e?.message ?? String(e));
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hasCatalog = catalog.pairs.length > 0 && catalog.timeframes.length > 0;
  return { catalog, catalogError, hasCatalog };
}

