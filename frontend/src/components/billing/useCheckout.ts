'use client';

export function useCheckout() {
  return async function checkout() {
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const { url, error } = await res.json();
      if (error || !url) throw new Error(error || 'no url');
      window.location.href = url; // StripeのCheckoutに遷移
    } catch (e) {
      alert('決済画面に進めませんでした。時間をおいて再度お試しください。');
    }
  };
}
