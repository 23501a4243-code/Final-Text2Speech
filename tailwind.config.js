/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#faf8ff',
          100: '#f3eeff',
          200: '#e8deff',
          300: '#d5c2ff',
          400: '#b899fd',
          500: '#9b6dfb',
          600: '#8347f5',
          700: '#702fe0',
          800: '#5c24bd',
          900: '#4d1f9c',
          950: '#2e0c6b',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
