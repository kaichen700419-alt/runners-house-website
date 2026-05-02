/**
 * Playwright E2E 測試設定
 *
 * 設計原則：
 *  - 單一 chromium project：初版只跑 chromium 以加快 CI；多瀏覽器待業主驗收後再開
 *  - webServer：先 build（npm run build）再 preview，從靜態產物驗證最接近線上的行為，
 *    避免 dev server 的 HMR / source map 影響真實場景
 *  - reuseExistingServer：本機開發時若 4321 已被占用就直接接上，CI 上強制全新啟動
 *  - retries：CI 上保留 1 次重試（緩衝偶發網路抖動），本地不重試逼出真錯
 *  - reporter：本地 list（即時讀），CI 額外 html 利於下載 artifact 排查
 *
 * 重要決定：
 *   testMatch 收斂為 `**\/*.spec.ts`，讓 vitest（*.test.ts）與 playwright（*.spec.ts）
 *   兩條測試線完全不重疊。
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const isCi = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  // E2E 普遍較慢，給單測 30 秒，避免長頁面 first paint 抖動誤殺
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // CI 並行度設較低保證穩定；本地用 50% 邏輯核心
  fullyParallel: true,
  workers: isCi ? 2 : undefined,
  // forbidOnly：避免不小心 commit 帶有 test.only 的測試到 main
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,

  reporter: isCi
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 預設語系；個別 spec 切換 zh-Hant-TW / en
    locale: 'zh-Hant-TW',
    timezoneId: 'Asia/Taipei',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 由 Playwright 自動拉起靜態預覽伺服器；先 build 再 preview，最接近 Cloudflare Pages 真實行為
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4321',
    url: BASE_URL,
    reuseExistingServer: !isCi,
    // build 含 astro check + 全頁面靜態產出，預設 5 分鐘上限
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
