/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cpv-azul': '#0f172a', // Color institucional que vimos en tu idea
      }
    },
  },


  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
