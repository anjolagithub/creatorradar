/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          900: '#14532d',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
