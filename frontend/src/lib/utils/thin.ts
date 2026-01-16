export function thinData(points: any[], maxPoints = 2000) {
  const n = points.length;
  if (n <= maxPoints) return points;

  const step = Math.floor(n / maxPoints);
  return points.filter((_, idx) => idx % step === 0);
}
