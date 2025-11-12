/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9e7',
          100: '#fdf2c4',
          200: '#fbe88c',
          300: '#f7d94d',
          400: '#f3c617',
          500: '#d4a43e',
          600: '#ba8b2d',
          700: '#9e6f25',
          800: '#805723',
          900: '#6a471f',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
