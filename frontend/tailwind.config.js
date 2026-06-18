/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'from-blue-400', 'to-blue-600',
    'from-purple-400', 'to-purple-600',
    'from-green-400', 'to-green-600',
    'from-orange-400', 'to-orange-600',
    'from-pink-400', 'to-pink-600',
    'from-yellow-400', 'to-yellow-600',
    'from-indigo-400', 'to-indigo-600',
    'from-red-400', 'to-red-600',
    'from-teal-400', 'to-teal-600',
    'from-cyan-400', 'to-cyan-600'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}