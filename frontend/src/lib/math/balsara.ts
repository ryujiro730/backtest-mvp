// lib/math/balsara.ts
export type Params = {
  p: number;   // 勝率 (0..1)
  rr: number;  // リスクリワード（勝ち:負け = rr:1）
  f: number;   // リスク率（例: 0.02 = 2%）
  n: number;   // 試行回数
  ruinFrac?: number; // 破産閾値（初期資金の何%以下で破産とみなす）既定0.2 (=20%)
};

// 参考表示（ケリー）
export function kellyFraction({ p, rr }: { p: number; rr: number }) {
  return (p * (1 + rr) - 1) / rr;
}

/**
 * 連敗ベースの実用近似：
 *  - 初期資金を1とし、毎回 f を失うと (1 - f)^k で k 連敗時の資金。
 *  - これが ruinFrac を下回る k を閾値にする。
 *  - N試行中に「k連敗以上が一度でも出る確率」を 1 - (1 - q^k)^(N - k + 1) で近似。
 *    （q^k は「k回連続で負ける確率」。窓数は N - k + 1）
 *  - 勝ち負けは独立同分布の近似。
 */
export function riskOfRuinRunApprox({
  p, rr, f, n, ruinFrac = 0.2,
}: Params) {
  const q = Math.max(0, Math.min(1, 1 - p)); // 負け確率
  if (f <= 0 || f >= 1 || n <= 0 || ruinFrac <= 0 || ruinFrac >= 1) return 0;
  // “k連敗すると破産”となる k を求める
  // (1 - f)^k <= ruinFrac  →  k >= ln(ruinFrac) / ln(1 - f)
  const k = Math.ceil(Math.log(ruinFrac) / Math.log(1 - f));
  if (k <= 0) return 1;
  // N試行での「k連敗が一度でも発生する確率」を区間独立近似で
  const windows = Math.max(1, n - k + 1);
  const probStreak = Math.pow(q, k);                  // その区間がk連敗になる確率
  const noStreakAll = Math.pow(1 - probStreak, windows);
  const ruinProb = 1 - noStreakAll;
  // 勝ちのサイズ（RR）が高いと、実際は“連敗だけで破産”しにくい補正を少し入れる
  // 期待値が正のときは、わずかに破産確率を緩和（軽い減衰）
  const edge = p * rr - (1 - p);
  const adj = edge > 0 ? Math.max(0.85, 1 - 0.1 * edge) : 1; // 0.85〜1.0の範囲
  return Math.min(1, Math.max(0, ruinProb * adj));
}
