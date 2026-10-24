// Konfigurasi Vitest untuk mendukung stage Test di Jenkins (npx vitest run --coverage)
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';

// Sinkronkan ke src/ bila belum dibuat oleh postinstall di CI/Jenkins
if (!fs.existsSync('./src/app.js')) {
  try {
    fs.mkdirSync('./src', { recursive: true });
    fs.cpSync('./frontend/src', './src', { recursive: true });
    fs.cpSync('./backend/src', './src', { recursive: true });
    fs.cpSync('./backend/tests', './src', { recursive: true });
  } catch {
    // Abaikan jika gagal menyalin pada environment read-only
  }
}

const hasRootSrc = fs.existsSync('./src/app.js');

export default defineConfig({
  test: {
    globals: true,
    include: ['backend/tests/**/*.test.js', 'frontend/tests/**/*.test.{js,jsx}'],
    environment: 'node',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: hasRootSrc ? ['src/**/*.js'] : ['backend/src/**/*.js'],
      exclude: ['**/server.js', '**/*.test.js', '**/*.test.jsx']
    }
  }
});
