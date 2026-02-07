'use client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      console.log('supabase session:', s);

      const res = await fetch('/api/account/plan', {
        cache: 'no-store',
        credentials: 'include',
        headers: s.session?.access_token
          ? { Authorization: `Bearer ${s.session.access_token}` }
          : {},
      });

      const json = await res.json();
      console.log('api/account/plan response:', json);
      setResult(json);
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug Plan</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
