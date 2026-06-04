/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#B45309', dim: '#D97706' },
        canvas: { base: '#F5F4F1', from: '#F5F4F1', to: '#F5F4F1' },
        card: { surface: '#FFFFFF', border: '#E2E8F0', hover: '#FFFFFF' },
        text: { heading: '#0F172A', body: '#334155', muted: '#64748B', faint: '#94A3B8' },
        data: { bar: '#D97706', line: '#64748B', co2: '#059669' },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}