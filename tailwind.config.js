/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terracotta': '#C35A38',
        'sand': '#E6D2AA',
        'ocean': '#1A5276',
        'leaf': '#2E7D32',
        'sunset': '#FF8C00',
      },
    },
  },
  plugins: [],
}