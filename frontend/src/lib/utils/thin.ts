/**
 * グラフ用にダウンサンプリングする。
 * この点数を超えると描画が重くなるため、目視で形が変わらない程度に間引く。
 * 2,000〜3,000 点あれば 1px あたり複数点になり、曲線として十分滑らかに見える。
 */
export const CHART_DOWNSAMPLE_THRESHOLD = 3000;
export const CHART_MAX_POINTS = 2500;

export function thinData(
  points: any[],
  maxPoints: number = CHART_MAX_POINTS
): any[] {
  const n = points.length;
  if (n <= maxPoints) return points;

  const step = n / maxPoints;
  const result: any[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.min(Math.floor(i * step), n - 1);
    result.push(points[idx]);
  }
  // 末尾を確実に含める（最終値がグラフに乗るように）
  if (n > 0 && result.length > 0 && result[result.length - 1] !== points[n - 1]) {
    result.push(points[n - 1]);
  }
  return result;
}
