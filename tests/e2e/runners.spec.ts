/**
 * E2E：跑者主場 /runners
 *
 * 涵蓋：
 *  - 200 載入
 *  - 賽事區塊 / 路線區塊 / 服務區塊三個 anchor 存在
 *  - 至少有一張賽事卡 + 至少有一張路線卡（用區塊內 li / article 推算）
 */
import { test, expect } from '@playwright/test';

test.describe('跑者主場 /runners', () => {
  test('成功載入並顯示主標', async ({ page }) => {
    const res = await page.goto('/runners');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#runners-page-heading')).toBeVisible();
  });

  test('賽事 / 路線 / 服務三大區塊皆存在', async ({ page }) => {
    await page.goto('/runners');
    await expect(page.locator('#runners-events-heading')).toBeVisible();
    await expect(page.locator('#runners-routes-heading')).toBeVisible();
    await expect(page.locator('#runners-services-heading')).toBeVisible();
  });

  test('賽事與路線各至少一張卡片', async ({ page }) => {
    await page.goto('/runners');
    const eventsSection = page.locator('section[aria-labelledby="runners-events-heading"]');
    const routesSection = page.locator('section[aria-labelledby="runners-routes-heading"]');
    expect(await eventsSection.locator('li, article').count()).toBeGreaterThanOrEqual(1);
    expect(await routesSection.locator('li, article').count()).toBeGreaterThanOrEqual(1);
  });
});
