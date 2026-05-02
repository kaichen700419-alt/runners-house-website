/**
 * E2E：首頁
 *
 * 涵蓋：
 *  - 頁面載入與 SEO 基本元素（title、meta description、canonical、JSON-LD）
 *  - Header 主導覽 7 個連結存在且 href 正確
 *  - 主要 CTA「詢問訂房」可點擊（跳轉到 /contact）
 *  - 語言切換器：點 EN 跳到 /en
 */
import { test, expect } from '@playwright/test';

test.describe('首頁 /', () => {
  test('成功載入並含基本 SEO meta', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/跑者之家|Runners House/);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect((description ?? '').length).toBeGreaterThan(30);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/^https?:\/\//);

    // 至少一筆 JSON-LD（首頁注入 LodgingBusiness）
    const ldCount = await page.locator('script[type="application/ld+json"]').count();
    expect(ldCount).toBeGreaterThanOrEqual(1);
  });

  test('Hero 區與主要 CTA 可被看見', async ({ page }) => {
    await page.goto('/');
    // 第一個 h1 必為主視覺標題
    await expect(page.locator('h1').first()).toBeVisible();
    // 主要 CTA「詢問訂房」（出現在 header CTA 與 ClosingCta，至少一個可見）
    const cta = page.getByRole('link', { name: /詢問訂房|Book.*Inquiry/i }).first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toMatch(/\/contact/);
  });

  test('主導覽 7 個項目皆存在並可導向對應頁', async ({ page }) => {
    await page.goto('/');
    const expectedHrefs = ['/', '/about', '/rooms', '/runners', '/charging', '/nearby', '/contact'];
    for (const href of expectedHrefs) {
      // header 與 mobile menu 都會有同一個 href，存在即可
      const link = page.locator(`a[href="${href}"]`).first();
      await expect(link).toBeAttached();
    }
  });

  test('語言切換：點 EN 跳到 /en 並維持 zh 連結對等', async ({ page }) => {
    await page.goto('/');
    const enLink = page.getByRole('link', { name: /^EN$/ }).first();
    await expect(enLink).toBeVisible();
    await enLink.click();
    await expect(page).toHaveURL(/\/en\/?$/);
    // EN 頁面再次顯示語言切換器，且回切 zh 應導回 /
    const zhLink = page.getByRole('link', { name: /^中文$/ }).first();
    await expect(zhLink).toBeVisible();
    expect(await zhLink.getAttribute('href')).toBe('/');
  });
});
