import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// Konfigurasi Vite untuk aplikasi frontend Moodify dengan proxy lokal & izin akses font monorepo
export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [react()],
  css: {
    postcss: path.join(__dirname, 'postcss.config.js')
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'chart-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }
          }
          return undefined;
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      // Izinkan Vite membaca file font .woff2 di ../node_modules agar tidak terkena 403 Forbidden
      allow: [__dirname, repoRoot]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
});
