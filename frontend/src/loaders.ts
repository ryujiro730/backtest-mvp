export const loaders = {
  lp: {
    en: () => import('@/messages/en/lp.json').then(m => m.default),
    ja: () => import('@/messages/ja/lp.json').then(m => m.default),
  },
  paywall: {
    en: () => import('@/messages/en/paywall.json').then(m => m.default),
    ja: () => import('@/messages/ja/paywall.json').then(m => m.default),
  }
} as const;
