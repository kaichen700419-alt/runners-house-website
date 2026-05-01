/**
 * Vitest 設定
 *
 * 使用 jsdom 環境以便測試 DOM 相關 helper。
 * 路徑別名同步 tsconfig.json，方便測試以 `@/...` 引入原始碼。
 */
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@components': path.resolve(rootDir, 'src/components'),
      '@layouts': path.resolve(rootDir, 'src/layouts'),
      '@i18n': path.resolve(rootDir, 'src/i18n'),
      '@content': path.resolve(rootDir, 'src/content'),
      '@assets': path.resolve(rootDir, 'src/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/i18n/**/*.ts', 'src/lib/**/*.ts'],
    },
  },
});
