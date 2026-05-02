/**
 * E2E：周邊景點 /nearby
 *
 * 涵蓋：
 *  - 200 載入
 *  - 「不供餐」明示區塊存在
 *  - 景點分區與餐廳分區分別存在
 */
import { test, expect } from '@playwright/test';

test.describe('周邊景點與美食 /nearby', () => {
  test('成功載入並顯示主標', async ({ page }) => {
    const res = await page.goto('/nearby');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#nearby-page-heading')).toBeVisible();
  });

  test('「不供餐」明示區塊', async ({ page }) => {
    await page.goto('/nearby');
    await expect(page.locator('#nearby-nomeals-heading')).toBeVisible();
  });

  test('景點與餐廳分區皆存在', async ({ page }) => {
    await page.goto('/nearby');
    // spots 區塊使用 aria-labelledby="nearby-spots-heading"
    await expect(page.locator('#nearby-spots-heading')).toBeVisible();
    // 餐廳區塊（NearbySections 內含餐廳 grouping，至少 h2 之一）
    const h2Texts = await page.locator('main h2').allTextContents();
    const hasRestaurants = h2Texts.some((t) => /餐廳|美食|Restaurant|Eats/i.test(t));
    expect(hasRestaurants).toBe(true);
  });
});
