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
          light: '#EBF4FC'
        },
        pistachio: {
          DEFAULT: 'var(--color-pistachio)',
          dark: '#9FA83E',
          light: '#F4F6DF'
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)'
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
        soft: '0 10px 25px -5px rgba(87, 152, 215, 0.12)',
        'soft-lg': '0 18px 35px -8px rgba(87, 152, 215, 0.18)'
      }
    }
  },
  plugins: []
};
