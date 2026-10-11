/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0B4F9C', light: '#1565C0', dark: '#093D7A' },
        teal: { DEFAULT: '#1E9E8F', light: '#25B8A6', dark: '#177A6F' },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
