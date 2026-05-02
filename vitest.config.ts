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
    // unit 測試走 *.test.ts；E2E（Playwright）一律走 tests/e2e/**/*.spec.ts，
    // 兩條測試線完全分離，避免 vitest 誤吃 @playwright/test 的 import 而炸開。
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/i18n/**/*.ts', 'src/lib/**/*.ts'],
    },
  },
});
