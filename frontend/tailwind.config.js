// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {fontSize: {
        'fluid-h1': ['clamp(28px, calc(4.78vw + 10.78px), 72px)', { lineHeight: '1.1' }],
        'fluid-body': ['clamp(14px, calc(1vw + 10px), 18px)', { lineHeight: '1.55' }],
      },} },
  plugins: []
};

