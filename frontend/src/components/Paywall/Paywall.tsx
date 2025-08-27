import { useState } from "react";
const API = (import.meta as any).env?.VITE_API_BASE || "";

export default function Paywall() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goCheckout = async () => {
    try {
      setLoading(true); setErr(null);
      const res = await fetch(`${API}/api/checkout`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ priceId: import.meta.env.VITE_STRIPE_PRICE_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "checkout failed");
      window.location.href = data.url; // Stripeへ遷移
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-semibold">Pro（月額）</div>
          <div className="text-muted text-sm">バックテストを制限なしで実行</div>
        </div>
        <div className="text-lg font-semibold">¥3,000<span className="text-muted text-sm"> / 月</span></div>
      </div>

      <button onClick={goCheckout} disabled={loading} className="w-64">
        {loading ? "処理中..." : "¥3,000でアップグレード"}
      </button>
      {err && <p className="text-sm mt-3" style={{color:"#ef4444"}}>{err}</p>}
    </div>
  );
}

