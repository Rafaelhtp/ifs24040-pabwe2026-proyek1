// Konfigurasi Vitest untuk mendukung stage Test di Jenkins (npx vitest run --coverage)
import { defineConfig } from 'vitest/config';

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
      include: ['backend/src/**/*.js'],
      exclude: ['backend/src/server.js']
    }
  }
});
