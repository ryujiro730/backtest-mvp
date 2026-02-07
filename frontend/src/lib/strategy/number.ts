export function toInt(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

export const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
