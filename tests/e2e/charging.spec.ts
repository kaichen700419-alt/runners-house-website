/**
 * E2E：特斯拉超充 /charging
 *
 * 涵蓋：
 *  - 200 載入
 *  - 付費資訊明示（頁面文字必含「付費 / 收費 / NT$ / 元」其中一個關鍵字）
 *  - 主標可見
 */
import { test, expect } from '@playwright/test';

test.describe('特斯拉超充 /charging', () => {
  test('成功載入並顯示主標', async ({ page }) => {
    const res = await page.goto('/charging');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('明示付費資訊（避免被誤會免費）', async ({ page }) => {
    await page.goto('/charging');
    const body = await page.locator('main').innerText();
    // 任何一個明示付費的關鍵字皆可
    const hasPaidNotice = /付費|收費|NT\$|元\/|計費|料金|fee|paid/i.test(body);
    expect(hasPaidNotice).toBe(true);
  });
});
