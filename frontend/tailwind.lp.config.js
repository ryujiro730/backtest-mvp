// tailwind.config.js  ← 以前のままでOK
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx,md,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
    // LPを pages/ や marketing/ に置いてるなら↓も追加
    './src/pages/**/*.{js,jsx,ts,tsx,md,mdx}',
    './src/marketing/**/*.{js,jsx,ts,tsx,md,mdx}',
    './src/content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        'fluid-h1': ['clamp(28px, calc(4.78vw + 10.78px), 72px)', { lineHeight: '1.1' }],
        'fluid-body': ['clamp(14px, calc(1vw + 10px), 18px)', { lineHeight: '1.55' }],
      },
      // （任意）影/角丸だけ足したいならここで拡張
      boxShadow: {
        smx: '0 4px 14px rgba(17,24,39,.06)',
        mdx: '0 10px 24px rgba(17,24,39,.10)',
        lgx: '0 18px 40px rgba(17,24,39,.14)',
      },
      borderRadius: { '2xl': '1.25rem' },
      colors: { accent: { DEFAULT: '#3b82f6' } },
    },
  },
  plugins: [], // ← forms など入れない（LPが崩れる原因）
};

