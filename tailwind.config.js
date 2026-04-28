/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          50:  '#f0f7e6',
          100: '#dff0c0',
          200: '#c0e085',
          300: '#9dcc4d',
          400: '#7eb82a',
          500: '#5e9a14',
          600: '#4a7c0f',
          700: '#3a600d',
          800: '#2d4a0f',
          900: '#1a2e08',
        },
        soil: {
          100: '#c8a882',
          200: '#b08d62',
          300: '#8b6b43',
          400: '#6b4f2e',
          500: '#4d3520',
        },
        moss: '#4a5e2a',
        bark:  '#6b4f2e',
        leaf:  '#3d7a1c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
