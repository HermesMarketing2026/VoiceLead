import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hermes: {
          50:  '#fff4ef',
          100: '#ffe4d6',
          200: '#ffc5a8',
          300: '#ff9d70',
          400: '#ff6a36',
          500: '#E05A1F',
          600: '#c44a12',
          700: '#a33a0e',
          800: '#852f0f',
          900: '#6e2810',
        },
      },
    },
  },
  plugins: [],
}
export default config
