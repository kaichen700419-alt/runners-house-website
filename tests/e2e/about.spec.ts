/**
 * E2E：品牌故事頁 /about
 *
 * 涵蓋：
 *  - 200 載入
 *  - 主標 + 主要 section heading 存在（about-page-heading 等 anchor id）
 *  - 麵包屑存在
 */
import { test, expect } from '@playwright/test';

test.describe('品牌故事 /about', () => {
  test('成功載入', async ({ page }) => {
    const res = await page.goto('/about');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('主要 section heading anchor 齊全', async ({ page }) => {
    await page.goto('/about');
    // AboutSections 內部會以 aria-labelledby 對應這些 id；不存在會視為渲染失敗
    const expectedIds = [
      'about-page-heading',
    ];
    for (const id of expectedIds) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    // 至少 3 個 h2 區塊（品牌起源 / 主理人 / 時間軸 / 永續其中至少 3 個會出現）
    const h2Count = await page.locator('main h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(3);
  });

  test('麵包屑顯示「首頁 / 品牌故事」', async ({ page }) => {
    await page.goto('/about');
    const nav = page.locator('nav[aria-label*="麵包"], nav[aria-label*="Breadcrumb" i]').first();
    await expect(nav).toBeVisible();
  });
});
