/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandNavy: '#0A1931',
        brandNavyDark: '#050C1A',
        brandGold: '#C5A059',
        brandGoldHover: '#B28E46',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

