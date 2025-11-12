/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4 uses CSS-based configuration via @theme directive
  // This file is kept minimal for content scanning configuration
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  // Dark mode is now configured via the 'dark' class (default in v4)
  darkMode: 'selector',
}
