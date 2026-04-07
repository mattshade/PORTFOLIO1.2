/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1e3a8a',
        'brand-green': '#10b981',
        'brand-red': '#ef4444',
        'brand-yellow': '#f59e0b',
      },
    },
  },
  plugins: [],
}
