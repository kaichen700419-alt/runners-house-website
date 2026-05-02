/**
 * E2E：axe-core 無障礙稽核
 *
 * 對 7 個主要中文頁面 + 7 個英文對等頁面 + 5 個房型詳情頁執行 AxeBuilder.analyze()。
 *
 * 嚴格度：
 *  - WCAG 2.1 A + AA 標籤
 *  - 違規數必須為 0；若失敗會把違規 JSON 印出便於修
 *  - 排除 color-contrast 在 disabled 狀態（會誤判 disabled button hover）
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES_ZH = [
  '/',
  '/about',
  '/rooms',
  '/runners',
  '/charging',
  '/nearby',
  '/contact',
] as const;

const PAGES_EN = PAGES_ZH.map((p) => (p === '/' ? '/en' : `/en${p}`));

const ROOM_PAGES = [
  '/rooms/standard-double',
  '/rooms/standard-quad',
  '/rooms/backpack-4',
  '/rooms/backpack-6',
  '/rooms/sea-suite',
] as const;

const ALL_PAGES = [...PAGES_ZH, ...PAGES_EN, ...ROOM_PAGES];

for (const path of ALL_PAGES) {
  test(`a11y: ${path} 無 WCAG 2.1 A/AA 違規`, async ({ page }) => {
    await page.goto(path);
    // 等待主要內容載入
    await page.locator('main, h1').first().waitFor({ state: 'visible' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      // 把違規列表寫進失敗訊息便於 CI 直接看到
      console.error(`[a11y violations on ${path}]`, JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations).toEqual([]);
  });
}
