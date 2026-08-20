import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'generated'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
