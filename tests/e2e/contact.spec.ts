/**
 * E2E：聯絡頁 /contact
 *
 * 涵蓋：
 *  - 200 載入
 *  - 三聯 CTA（LINE / 電話 / 表單）皆存在
 *  - 表單必填欄位齊全：name / email / phone / check_in / check_out / guests / subject_topic / message
 *  - 表單驗證錯誤訊息：空送出 → 至少 1 個 .error-msg.show
 *  - email 格式錯誤 → email 欄位顯示 errorEmail 訊息
 */
import { test, expect } from '@playwright/test';

test.describe('聯絡頁 /contact', () => {
  test('成功載入', async ({ page }) => {
    const res = await page.goto('/contact');
    expect(res?.status()).toBe(200);
    await expect(page.locator('#contact-page-heading')).toBeVisible();
  });

  test('三聯 CTA 全數可見且 href 正確', async ({ page }) => {
    await page.goto('/contact');
    const trio = page.locator('.trio .trio-card');
    expect(await trio.count()).toBe(3);
    // LINE 為 https; 電話為 tel:; 表單為 #contact-form
    const lineHref = await trio.nth(0).locator('a.trio-btn').getAttribute('href');
    const phoneHref = await trio.nth(1).locator('a.trio-btn').getAttribute('href');
    const formHref = await trio.nth(2).locator('a.trio-btn').getAttribute('href');
    expect(lineHref).toMatch(/^https?:\/\//);
    expect(phoneHref).toMatch(/^tel:/);
    expect(formHref).toBe('#contact-form');
  });

  test('表單必填欄位齊全', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('#contact-form');
    await expect(form).toBeVisible();
    for (const name of [
      'name',
      'email',
      'phone',
      'check_in',
      'check_out',
      'guests',
      'subject_topic',
      'message',
    ]) {
      await expect(form.locator(`[name="${name}"]`)).toHaveCount(1);
    }
  });

  test('空白送出 → client-side 驗證顯示錯誤訊息', async ({ page }) => {
    await page.goto('/contact');
    // 點 submit 按鈕觸發 client 驗證（form 用 novalidate 故走 JS 路徑）
    await page.locator('#contact-form button[type="submit"]').click();
    // 至少 1 個錯誤訊息亮起
    const visibleErrors = page.locator('#contact-form .error-msg.show');
    await expect(visibleErrors.first()).toBeVisible({ timeout: 3000 });
  });

  test('email 格式錯誤 → email 欄位顯示錯誤', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('input[name="name"]').fill('測試使用者');
    await page.locator('input[name="email"]').fill('not-an-email');
    await page.locator('input[name="phone"]').fill('0912345678');
    // 選未來日期
    const tomorrow = new Date(Date.now() + 86400_000).toISOString().slice(0, 10);
    const dayAfter = new Date(Date.now() + 86400_000 * 2).toISOString().slice(0, 10);
    await page.locator('input[name="check_in"]').fill(tomorrow);
    await page.locator('input[name="check_out"]').fill(dayAfter);
    // 補 guests 欄位避免 guest count 驗證錯誤干擾測試的隔離性
    await page.locator('input[name="guests"]').fill('2');
    await page.locator('select[name="subject_topic"]').selectOption('booking');
    await page.locator('textarea[name="message"]').fill('這是一段超過十個字的測試訊息內容，用於通過 minLength 驗證');
    await page.locator('#contact-form button[type="submit"]').click();
    // 應出現 email 欄位的錯誤訊息
    await expect(page.locator('#err-email')).toHaveClass(/show/);
  });
});
