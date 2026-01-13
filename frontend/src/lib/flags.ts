// lib/flags.ts
export const flags = {
  freeMode:
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_FREE_MODE === "1" ||
       process.env.FREE_MODE === "1")) || false,
  // 将来、課金UIだけ別で切りたければこうしてもOK:
  // pricingEnabled: process.env.NEXT_PUBLIC_PRICING_ENABLED === "1",
};
