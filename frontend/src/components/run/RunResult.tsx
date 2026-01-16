'use client';

import { useEffect, useState } from 'react';

export function RunResult({ runId }: { runId: string | null }) {
  const [result, setResult] = useState<any>(null);


  useEffect(() => {
    if (!runId) return;

    console.log('polling reports for', runId);

    const t = setInterval(async () => {
      const res = await fetch(
        `/api/reports/${runId}`
      );

      if (res.status === 202) {
        console.log('still running');
        return;
      }

      if (res.ok) {
        const j = await res.json();
        setResult(j);
        clearInterval(t);
      }
    }, 2000);

    return () => clearInterval(t);
  }, [runId]);

  if (!runId) return null;
  if (!result) return <div>計算中…</div>;

  return <pre>{JSON.stringify(result, null, 2)}</pre>;
}
