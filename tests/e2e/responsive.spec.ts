/**
 * E2E：三種 viewport 截圖比對
 *
 * 涵蓋：375 (mobile) / 768 (tablet) / 1280 (desktop) 三種尺寸的首頁與聯絡頁。
 *
 * 不啟用 toHaveScreenshot 的快照比對（避免初版因字體渲染差異不穩定），
 * 只驗證主要元素在各 viewport 皆可見、Header 不會在 mobile 缺失漢堡按鈕。
 */
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('首頁主要元素可見', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1').first()).toBeVisible();
      // header 永遠存在
      await expect(page.locator('header.site-header')).toBeVisible();
    });

    test('聯絡頁表單於 viewport 內可見', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.locator('#contact-form')).toBeVisible();
    });

    if (vp.name === 'mobile') {
      test('mobile 尺寸下漢堡按鈕可見、桌面導覽隱藏', async ({ page }) => {
        await page.goto('/');
        // MobileMenu 通常以 button 呈現
        const mobileMenuBtn = page.locator('header button').first();
        await expect(mobileMenuBtn).toBeVisible();
        // desktop nav 在 < 1024 應隱藏
        const desktopNav = page.locator('nav.desktop-nav');
        await expect(desktopNav).toBeHidden();
      });
    }

    if (vp.name === 'desktop') {
      test('desktop 尺寸下水平導覽可見', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('nav.desktop-nav')).toBeVisible();
      });
    }
  });
}
