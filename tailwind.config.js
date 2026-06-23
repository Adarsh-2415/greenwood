/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          red: '#DF2531',
          deepRed: '#A61B24',
          gold: '#D4AF37',
          dark: '#111111',
          gray: '#4B5563',
          light: '#F8F9FA',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
