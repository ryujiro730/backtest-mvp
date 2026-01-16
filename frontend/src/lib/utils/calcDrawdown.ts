// src/lib/utils/calcDrawdown.ts

export function calcDrawdown(equity) {
  let peak = -Infinity;
  return equity.map(p => {
    const e = Number(p.e);
    if (!isFinite(e)) return { t: p.t, dd: 0 };

    peak = Math.max(peak, e);
    if (!isFinite(peak) || peak === 0) return { t: p.t, dd: 0 };

    return {
      t: p.t,
      dd: (e - peak) / peak,
    };
  });
}
