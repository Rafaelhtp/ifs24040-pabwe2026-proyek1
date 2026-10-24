// Konfigurasi Vitest untuk mendukung stage Test di Jenkins (npx vitest run --coverage)
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';

// Sinkronkan backend/src ke src/ setiap kali Vitest dijalankan agar selalu konsisten di Jenkins
try {
  fs.rmSync('./src', { recursive: true, force: true });
  fs.cpSync('./backend/src', './src', { recursive: true });
  fs.rmSync('./src/server.js', { force: true });
} catch {
  // Abaikan jika gagal menyalin pada environment read-only
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
      exclude: ['**/server.js']
    }
  }
});
