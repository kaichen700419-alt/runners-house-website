# 跑者之家 Runners House｜民宿官方網站

台東縣長濱鄉「跑者之家 Runners House」民宿官方網站。由廢棄米倉重生改建、跑者主題、特斯拉超充服務。

## 技術選型

- **框架**：[Astro 6](https://astro.build/) — 靜態網站、零客戶端 JS、極致 SEO
- **樣式**：[Tailwind CSS 4](https://tailwindcss.com/) — Design tokens 雙軌主題（海洋運動 / 日系侘寂）
- **i18n**：Astro 原生 i18n routing，中文（zh-TW）/ 英文（en）雙語
- **內容**：Markdown / MDX
- **部署**：[Cloudflare Pages](https://pages.cloudflare.com/)
- **CI**：GitHub Actions（typecheck + build）+ GitHub Copilot Code Review

## 開發指令

| 指令 | 說明 |
| ---- | ---- |
| `npm install` | 安裝依賴 |
| `npm run dev` | 本機開發伺服器（http://localhost:4321） |
| `npm run build` | 型別檢查 + 靜態建置（輸出至 `dist/`） |
| `npm run preview` | 預覽建置後的網站 |
| `npm run typecheck` | 僅執行型別檢查 |
| `npm run test` | 執行 Vitest 單元測試 |
| `npm run test:e2e` | 執行 Playwright E2E 測試（含 axe-core 無障礙稽核） |
| `npm run test:e2e:ui` | Playwright UI 模式，互動式偵錯 E2E 測試 |
| `npm run test:a11y` | 僅執行 axe-core 無障礙稽核 |
| `npm run test:perf` | 執行 Lighthouse CI（建議僅於 CI 環境執行，本地需 Chrome） |

### E2E 測試前置作業

第一次執行需安裝 Playwright 瀏覽器 binary：

```bash
npx playwright install chromium
```

`npm run test:e2e` 會自動 `npm run build` + 啟動 preview server（http://localhost:4321）後執行 chromium 測試；
共 9 個 spec 檔，覆蓋 7 個主要頁面 + 5 個房型詳情 + 中英對等 + 響應式 + 表單驗證 + a11y 稽核。

## 環境變數（業主上線前必填）

複製 `.env.example` 為 `.env`，填入下列必填變數：

| 變數 | 說明 | 取得方式 |
| ---- | ---- | -------- |
| `PUBLIC_WEB3FORMS_KEY` | 聯絡頁表單後端 access_key | 至 https://web3forms.com/ 申請；輸入收件 email 後即可拿到 key |

未設定時聯絡頁表單可正常顯示但**送出會失敗**。建置時若仍為 placeholder，會在 console 印出警告但不中斷 build。

## 專案結構

```
src/
├── assets/        # 圖片、SVG、影片等靜態資產
├── components/    # 可重用 UI 元件
├── content/       # 房型、景點、靜態內容（Markdown）
├── i18n/          # 多語言字典與工具
├── layouts/       # 頁面 Layout
├── lib/           # 純函式工具
├── pages/         # 路由頁面（Astro 約定）
└── styles/        # 全域 CSS 與 design tokens
```

## 部署（Cloudflare Pages）

完整部署步驟、安全 header 設定、舊 Wix 路徑導向、緊急回滾流程詳見
[`docs/deployment.md`](./docs/deployment.md)。

簡述：

1. Cloudflare Dashboard → Workers & Pages → Connect to Git，選 `main` 分支
2. Build command：`npm run build`、Output dir：`dist`、Node 22
3. Environment variables 設定 `PUBLIC_WEB3FORMS_KEY`（必填）與 `PUBLIC_GA_ID`（選填）
4. `public/_headers`、`public/_redirects` 會自動套用（含 CSP/HSTS/X-Frame-Options 與舊 Wix 路徑 301）
5. `wrangler.toml` 已備好，亦可 `wrangler pages deploy dist` 從本地推送

## CI

`docs/ci-template.yml` 為 GitHub Actions workflow 模板，啟用步驟：

```bash
gh auth refresh -h github.com -s workflow
mv docs/ci-template.yml .github/workflows/ci.yml
git add -A && git commit -m "ci: 啟用 GitHub Actions CI" && git push
```

包含 4 個 job：typecheck-build / unit-test / e2e-test（Playwright + axe）/ lighthouse。

## 開發守則

- 所有使用者可見字串必須走 i18n 字典
- 所有顏色、字型、間距使用 `src/styles/global.css` 中的 design tokens
- 所有圖片使用 Astro `<Image>` 元件
- 所有外部連結加 `rel="noopener noreferrer"`
- 任何 PR 必須通過七重審查（六重本地 + Copilot 雲端）
- 詳見 `.github/copilot-instructions.md`

## 授權

© Runners House. All rights reserved.
