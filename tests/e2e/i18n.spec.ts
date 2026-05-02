/**
 * E2E：i18n 對等切換
 *
 * 涵蓋：
 *  - 所有 7 個主要頁面，從 zh 切到 en 後 URL 形如 `/en/<同樣 path>`
 *  - 切回 zh 後 URL 為原本的 zh path
 *  - <html lang> 屬性正確切換
 */
import { test, expect } from '@playwright/test';

const ZH_PATHS = [
  '/',
  '/about',
  '/rooms',
  '/runners',
  '/charging',
  '/nearby',
  '/contact',
] as const;

test.describe('i18n 對等切換', () => {
  for (const zhPath of ZH_PATHS) {
    test(`${zhPath} → EN 對等路徑且 html lang 正確`, async ({ page }) => {
      await page.goto(zhPath);
      // zh 頁 html lang 必含 zh
      expect(await page.locator('html').getAttribute('lang')).toMatch(/zh/i);

      const enLink = page.getByRole('link', { name: /^EN$/ }).first();
      await enLink.click();

      const expectedEnPath = zhPath === '/' ? '/en' : `/en${zhPath}`;
      await expect(page).toHaveURL(new RegExp(`${expectedEnPath}/?$`));
      expect(await page.locator('html').getAttribute('lang')).toMatch(/en/i);

      // 再切回中文，URL 必回到原 zhPath
      const zhLink = page.getByRole('link', { name: /^中文$/ }).first();
      await zhLink.click();
      const expectedZhPattern = zhPath === '/' ? '/$' : `${zhPath}/?$`;
      await expect(page).toHaveURL(new RegExp(expectedZhPattern));
    });
  }
});
