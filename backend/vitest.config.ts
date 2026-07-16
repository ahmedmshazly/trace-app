import { defineConfig } from 'vitest/config';

/**
 * Test runner config. `tests/setup.ts` must run before any test module imports
 * `src/*`, so the validated config (which reads process.env at import time) has
 * its required values. setupFiles are evaluated before each test file's imports.
 *
 * A single MongoMemoryServer is started in globalSetup and shared across files
 * (fileParallelism off) so clearDb cannot race concurrent suites.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    globalSetup: ['tests/global-setup.ts'],
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/types/**'],
    },
  },
});
