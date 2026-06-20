import { defineConfig } from 'vitest/config';

/**
 * Test runner config. `tests/setup.ts` must run before any test module imports
 * `src/*`, so the validated config (which reads process.env at import time) has
 * its required values. setupFiles are evaluated before each test file's imports.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/types/**'],
    },
  },
});
