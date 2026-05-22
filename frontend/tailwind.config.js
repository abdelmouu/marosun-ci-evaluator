/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E8A020',
          dim: '#C4851A',
        },
        canvas: {
          base: '#EDF1F7',
          from: '#E8EEF5',
          to: '#F2F5FA',
        },
        card: {
          surface: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(210, 222, 240, 0.90)',
          hover: 'rgba(255, 255, 255, 0.92)',
        },
        text: {
          heading: '#1A2540',
          body: '#2E3F5C',
          muted: '#6B7FA3',
          faint: '#9BABC8',
        },
        data: {
          bar: '#4F7CAC',
          line: '#E8A020',
          co2: '#2D7D5B',
        },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}