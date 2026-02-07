// frontend/tailwind.app.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/forms')], // ← 見た目を素直に
  darkMode: ['class', '[data-theme="dark"]'], // 将来用。今回は light 固定
};
