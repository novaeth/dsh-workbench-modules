import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const shell = (subpath: string): string => fileURLToPath(import.meta.resolve(`@dsh-workbench/core/${subpath}`));

export default defineConfig({
  resolve: {
    alias: [{ find: '@dsh-workbench/core/client', replacement: shell('client/esm') }],
  },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
