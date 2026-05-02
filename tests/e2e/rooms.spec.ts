/**
 * E2E：房型列表 + 詳情
 *
 * 涵蓋：
 *  - /rooms 列表頁載入
 *  - 5 個房型詳情頁皆 200 並含主標
 *  - 麵包屑於詳情頁正常運作
 */
import { test, expect } from '@playwright/test';

const ROOM_SLUGS = [
  'standard-double',
  'standard-quad',
  'backpack-4',
  'backpack-6',
  'sea-suite',
] as const;

test.describe('房型 /rooms', () => {
  test('列表頁成功載入並列出多個房型', async ({ page }) => {
    const res = await page.goto('/rooms');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#rooms-list-page-heading')).toBeVisible();
    // 房型卡至少 5 張
    const cards = page.locator('main h2').filter({ hasNotText: /相關|延伸|你可能/ });
    expect(await cards.count()).toBeGreaterThanOrEqual(5);
  });

  for (const slug of ROOM_SLUGS) {
    test(`房型詳情頁 /rooms/${slug} 200 + 含主標`, async ({ page }) => {
      const res = await page.goto(`/rooms/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
      // 麵包屑必含
      const breadcrumb = page.locator('nav[aria-label*="麵包"], nav[aria-label*="Breadcrumb" i]').first();
      await expect(breadcrumb).toBeVisible();
    });
  }

  test('麵包屑可從詳情頁回到 /rooms', async ({ page }) => {
    await page.goto('/rooms/standard-double');
    const backLink = page.locator('nav a[href="/rooms"]').first();
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/rooms\/?$/);
  });
});
