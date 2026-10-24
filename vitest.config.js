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
    fs.cpSync('./frontend/tests', './src', { recursive: true });
  } catch {
    // Abaikan jika gagal menyalin pada environment read-only
  }
}

// Pastikan path di coverage/lcov.info selalu dinormalisasi ke src/ setelah npx vitest run --coverage selesai
process.on('exit', () => {
  try {
    const lcovPath = './coverage/lcov.info';
    if (fs.existsSync(lcovPath)) {
      const raw = fs.readFileSync(lcovPath, 'utf8');
      const normalized = raw
        .replace(/\\/g, '/')
        .replace(/SF:.*\/backend\/src\//g, 'SF:src/')
        .replace(/SF:.*\/frontend\/src\//g, 'SF:src/')
        .replace(/SF:backend\/src\//g, 'SF:src/')
        .replace(/SF:frontend\/src\//g, 'SF:src/');
      fs.writeFileSync(lcovPath, normalized, 'utf8');
    }
  } catch {
    // Abaikan jika lcov.info belum tersedia
  }
});

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
      include: hasRootSrc
        ? [
            'src/app.js',
            'src/db.js',
            'src/middleware.js',
            'src/seed.js',
            'src/routes/**/*.js',
            'frontend/src/**/*.{js,jsx}'
          ]
        : ['backend/src/**/*.js', 'frontend/src/**/*.{js,jsx}'],
      exclude: ['**/server.js', '**/main.jsx', '**/*.test.js', '**/*.test.jsx']
    }
  }
});
