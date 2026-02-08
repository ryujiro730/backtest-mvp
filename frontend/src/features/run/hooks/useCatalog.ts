'use client';
import { useEffect, useState } from "react";
import type { Catalog } from "@/src/features/run/types";

// 同一オリジンの Next API ルート経由でプロキシ（Vercel でも VPS バックエンドに届く）
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog>({ pairs: [], timeframes: [], items: [] });
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/catalog", { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          setCatalog({
            pairs: Array.isArray(data?.pairs) ? data.pairs : [],
            timeframes: Array.isArray(data?.timeframes) ? data.timeframes : [],
            items: Array.isArray(data?.items) ? data.items : [],
          });
          setCatalogError(null);
        } else if (!cancelled && !res.ok) {
          setCatalog({ pairs: [], timeframes: [], items: [] });
          setCatalogError(data?.detail ?? `GET /api/catalog ${res.status}`);
        }
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

