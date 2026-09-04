import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFDFB',
          100: '#FAF7F2',
          200: '#F5EDE0',
          300: '#EDE2CE',
          400: '#E0D0B0',
          500: '#C9B68E',
        },
        charcoal: {
          700: '#3D3D3D',
          800: '#2D2D2D',
          900: '#1A1A1A',
        },
        amber: {
          warm: '#D4A574',
          deep: '#B8860B',
          light: '#F5DEB3',
        },
        champagne: '#F7E7CE',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
