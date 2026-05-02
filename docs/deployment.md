# Cloudflare Pages 部署指南

跑者之家官網部署於 [Cloudflare Pages](https://pages.cloudflare.com/)。
本文件說明從零開始將本專案上線的完整步驟，以及上線後的驗收檢查清單。

## 1. 部署前置條件

| 項目 | 說明 |
| ---- | ---- |
| Cloudflare 帳號 | 已開通 Pages 服務（免費方案即可，自帶 SSL 與 CDN） |
| GitHub repo 權限 | 業主有 admin 權限可授權 Cloudflare app |
| Web3Forms access key | 至 https://web3forms.com 申請 → 設為 `PUBLIC_WEB3FORMS_KEY` |
| 自訂網域 | `runnershouse.tw`（或業主指定）的 DNS 控制權 |

## 2. 透過 Cloudflare Pages Dashboard 連結 GitHub（推薦）

1. 登入 Cloudflare Dashboard → 左側選單「Workers & Pages」
2. 「Create application」→ 選 **Pages** → **Connect to Git**
3. 選取 `runners-house-website` repo，授權後選擇 `main` 分支
4. Build 設定：
   - **Framework preset**：`Astro`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Root directory**：（留空，預設根目錄）
   - **Node version**：`22`（Project → Settings → Environment variables 加上 `NODE_VERSION = 22`）
5. **Environment variables**（Production）：
   - `PUBLIC_WEB3FORMS_KEY` = （Web3Forms 後台拿到的 access key）
   - `PUBLIC_GA_ID` = （選填，啟用 GA4 時填入）
6. 「Save and Deploy」

部署完成後 Cloudflare 會給一個 `*.pages.dev` 預覽網址，先用此網址驗收。

## 3. 透過 Wrangler CLI 部署（CI 或本地推送）

`wrangler.toml` 已備好。本地需先安裝 wrangler 並登入：

```bash
npm i -g wrangler
wrangler login
```

部署：

```bash
npm run build
wrangler pages deploy dist --project-name runners-house-website
```

## 4. 自訂網域設定

1. Cloudflare Pages Project → **Custom domains** → **Set up a custom domain**
2. 輸入 `runnershouse.tw`（與 `www.runnershouse.tw`，依業主決定主網域）
3. Cloudflare 會自動設定 DNS（若網域 nameserver 託管於 Cloudflare）
   - 若 nameserver 不在 Cloudflare，需到 DNS 服務商加 `CNAME` 指向 `<project>.pages.dev`
4. SSL 憑證自動發放（Universal SSL）

## 5. `_headers` 與 `_redirects`

兩檔案位於 `public/`，build 後會被原封不動複製到 `dist/` 根目錄，由 Cloudflare Pages 自動讀取。

### `public/_headers` 已啟用的安全 header

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src https://www.google.com; connect-src 'self' https://api.web3forms.com; form-action https://api.web3forms.com 'self'`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

> CSP 允許 `frame-src https://www.google.com`（Google Maps 嵌入）與 `connect-src https://api.web3forms.com`（聯絡表單）。
> 若日後加入 GA4，需把 `script-src` 加上 `https://www.googletagmanager.com`、`connect-src` 加上 `https://*.google-analytics.com`。

### `public/_redirects` 舊 Wix 路徑導向

```
/runnershouse-room    /rooms    301
/rooms-1              /rooms    301
/courses              /runners  301
/xiang-mu             /nearby   301
/booking              /contact  301
```

## 6. 上線後驗收清單

- [ ] 首頁 `https://runnershouse.tw/` 200 載入、Hero 圖正常顯示
- [ ] 7 個主要頁面（首頁 / 品牌故事 / 房型 / 跑者主場 / 充電 / 周邊 / 聯絡）全數 200
- [ ] 5 個房型詳情頁全數 200
- [ ] 英文版 `/en/...` 全部頁面對等
- [ ] 麵包屑與 i18n 切換 URL 正確
- [ ] 聯絡表單填寫測試 → Web3Forms 收件 email 收到信
- [ ] Google Maps 嵌入正常顯示（CSP 不擋）
- [ ] 舊 Wix 路徑（如 `/runnershouse-room`）301 導向新路徑
- [ ] DevTools Console 0 error
- [ ] DevTools Network 0 紅色（除外部第三方）
- [ ] HSTS、CSP header 正確套用（curl -I 確認）
- [ ] Lighthouse 各分數達標：Performance ≥ 90、A11y = 100、Best Practices ≥ 90、SEO = 100

## 7. 自動部署觸發

連結 GitHub 後，Cloudflare Pages 預設行為：

- `main` 分支 push → 自動部署到 production（`runnershouse.tw`）
- 任何其他分支或 PR push → 自動部署到 preview（`<branch>.<project>.pages.dev`）

關閉預覽部署：Project → Settings → Builds & deployments → Preview deployments 設為 None。

## 8. 緊急回滾

Cloudflare Pages 會保留全部歷史部署。
回滾步驟：

1. Project → Deployments
2. 找到要回滾的歷史部署
3. 點「Manage deployment」→「Rollback to this deployment」

回滾為原子操作，秒級生效。
