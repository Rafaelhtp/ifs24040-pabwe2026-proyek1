// Konfigurasi Vitest untuk mendukung stage Test di Jenkins (npx vitest run --coverage)
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';

const hasRootSrc = fs.existsSync('./src/app.js');

export default defineConfig({
  test: {
    globals: true,
    include: ['backend/tests/**/*.test.js'],
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
