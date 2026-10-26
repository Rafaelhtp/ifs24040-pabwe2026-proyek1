import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,jsx}')
  ],
  theme: {
    extend: {
      colors: {
        frost: {
          DEFAULT: 'var(--color-frost)',
          light: '#F3F8FD',
          border: 'var(--color-frost-border)'
        },
        denim: {
          DEFAULT: 'var(--color-denim)',
          dark: 'var(--color-denim-dark)',
          light: '#EBF4FC',
          deep: '#193F68',
          rich: '#3875B2'
        },
        pistachio: {
          DEFAULT: 'var(--color-pistachio)',
          dark: '#9FA83E',
          light: '#F4F6DF'
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)'
        },
        energy: {
          4: '#A8BA42'
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans Variable"',
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif'
        ]
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        soft: '0 10px 25px -5px rgba(87, 152, 215, 0.12)',
        'soft-lg': '0 18px 35px -8px rgba(87, 152, 215, 0.18)'
      },
      spacing: {
        '18': '4.5rem'
      },
      borderWidth: {
        '3': '3px'
      },
      scale: {
        '102': '1.02'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
