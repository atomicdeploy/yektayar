import type { Config } from 'tailwindcss';
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3B82F6', // change to your brand primary
          dark: '#2563EB',
          light: '#93C5FD'
        }
      }
    }
  },
  plugins: []
} satisfies Config;