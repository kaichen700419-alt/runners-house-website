#!/usr/bin/env node
/**
 * 全站截圖工具：對所有頁面以桌面 + 行動兩個 viewport 截圖。
 * 用途：實際視覺驗證網站設計品質，找出留白、對比、排版、互動問題。
 * 執行：node scripts/screenshot-all.mjs（需 preview server 已啟動於 :4321）
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://localhost:4321';
const PAGES = [
  '/', '/about', '/rooms', '/rooms/standard-double', '/rooms/standard-quad',
  '/rooms/backpack-4', '/rooms/backpack-6', '/rooms/sea-suite',
  '/runners', '/charging', '/nearby', '/contact',
  '/en', '/en/about', '/en/rooms', '/en/rooms/standard-double',
  '/en/runners', '/en/charging', '/en/nearby', '/en/contact',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

async function main() {
  const outDir = path.resolve('screenshots');
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  let success = 0;
  let failed = 0;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    for (const url of PAGES) {
      const page = await ctx.newPage();
      const safeName = url === '/' ? 'home' : url.replace(/^\//, '').replace(/\//g, '_');
      try {
        await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(300);
        const file = path.join(outDir, `${vp.name}_${safeName}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`✓ ${vp.name} ${url}`);
        success++;
      } catch (err) {
        console.error(`✗ ${vp.name} ${url}: ${err.message}`);
        failed++;
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log(`\n總計：${success} 成功 / ${failed} 失敗`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
