// src/lib/math/expectancy.ts
export function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}

/**
 * 期待値（R換算）
 * - 1回の負け = -1R
 * - 1回の勝ち = +rr R
 * - コストは bps（口座比）→ R換算するために riskFraction(f) が必要
 */
export function expectancyR({
  p,
  rr,
  riskFraction,
  feeBpsRoundtrip = 0,
  slippageBpsRoundtrip = 0,
}: {
  p: number;              // 0..1
  rr: number;             // 0.1..20
  riskFraction: number;   // 0..1（例: 0.02）
  feeBpsRoundtrip?: number;      // 往復合計 bps（例: 5）
  slippageBpsRoundtrip?: number; // 往復合計 bps（例: 1）
}) {
  const f = Math.max(1e-9, riskFraction);

  const feePct = feeBpsRoundtrip / 10000;       // 0.0005
  const slipPct = slippageBpsRoundtrip / 10000; // 0.0001
  const costR = (feePct + slipPct) / f;         // 口座比コストをR換算

  const evR = p * rr - (1 - p) * 1 - costR;
  return { evR, costR };
}

/**
 * 損益分岐勝率（R換算コスト込み）
 * p_be = (1 + costR) / (rr + 1)
 */
export function breakevenWinrate({
  rr,
  costR,
}: {
  rr: number;
  costR: number;
}) {
  return (1 + costR) / (rr + 1);
}

/**
 * 勝率から損益分岐RR（R換算コスト込み）
 * rr_be = (1 + costR) / p - 1
 */
export function breakevenRR({
  p,
  costR,
}: {
  p: number;
  costR: number;
}) {
  return (1 + costR) / p - 1;
}
