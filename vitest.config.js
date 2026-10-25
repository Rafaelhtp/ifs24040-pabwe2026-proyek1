// Konfigurasi Vitest untuk pengujian unit aplikasi frontend Moodify (npx vitest run --coverage)
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';

// Pastikan path di coverage/lcov.info selalu dinormalisasi ke src/ setelah npx vitest run --coverage selesai
process.on('exit', () => {
  try {
    const lcovPath = './coverage/lcov.info';
    if (fs.existsSync(lcovPath)) {
      const raw = fs.readFileSync(lcovPath, 'utf8');
      const normalized = raw
        .replace(/\\/g, '/')
        .replace(/SF:.*\/src\//g, 'SF:src/');
      fs.writeFileSync(lcovPath, normalized, 'utf8');
    }
  } catch {
    // Abaikan jika lcov.info belum tersedia
  }
});

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'jsdom',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        '**/main.jsx',
        '**/*.test.js',
        '**/*.test.jsx',
        '**/node_modules/**'
      ]
    }
  }
});
