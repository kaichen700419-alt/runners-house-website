// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// 部署目標切換：DEPLOY_TARGET=gh-pages 時用 GitHub Pages 子路徑；預設用自訂網域
const DEPLOY_TARGET = process.env.DEPLOY_TARGET ?? 'production';
const SITE = DEPLOY_TARGET === 'gh-pages'
  ? 'https://kaichen700419-alt.github.io'
  : 'https://runnershouse.tw';
const BASE = DEPLOY_TARGET === 'gh-pages' ? '/runners-house-website' : undefined;

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['zh-TW', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
    fallback: {
      en: 'zh-TW',
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'zh-TW',
        locales: {
          'zh-TW': 'zh-TW',
          en: 'en',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    preview: {
      // 允許 cloudflared / ngrok / localtunnel 等臨時公開預覽 host
      allowedHosts: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
