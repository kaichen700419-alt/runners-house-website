#!/usr/bin/env node
/**
 * post-build 腳本
 *
 * 修補項目（依 MiniMax 健檢報告 2026-05-03）：
 *   1. 把 sitemap-index.xml 同步成 sitemap.xml（Google 標準名稱，提升爬取效率）
 *
 * 執行時機：astro build 完成後自動觸發。
 */
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexPath = path.join(distDir, 'sitemap-index.xml');
const sitemapPath = path.join(distDir, 'sitemap.xml');

if (!fs.existsSync(indexPath)) {
  console.warn('[post-build] sitemap-index.xml 不存在，跳過 sitemap.xml 同步');
  process.exit(0);
}

fs.copyFileSync(indexPath, sitemapPath);
console.log('[post-build] dist/sitemap.xml ← dist/sitemap-index.xml 已同步');
