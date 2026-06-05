/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0D6EFD', light: '#E3F0FF', dark: '#0056b3' },
        secondary: { DEFAULT: '#8B96A5', light: '#F7FAFC' },
        dark: { DEFAULT: '#1C1C1C', light: '#505050' },
        orange: { DEFAULT: '#FF9017' },
        teal: { DEFAULT: '#00B517', light: '#E5F1E3' },
        aqua: { DEFAULT: '#237C02', light: '#C3FFCB' },
        shade: { DEFAULT: '#F7F7F7', border: '#E3E8EE' }
      },
      fontFamily: { inter: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
