import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Konfigurasi Vite untuk aplikasi frontend Moodify
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  css: {
    postcss: path.join(__dirname, 'postcss.config.js')
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
