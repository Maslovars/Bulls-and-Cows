import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './Bulls-and-Cows/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});
