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

## 開發守則

- 所有使用者可見字串必須走 i18n 字典
- 所有顏色、字型、間距使用 `src/styles/global.css` 中的 design tokens
- 所有圖片使用 Astro `<Image>` 元件
- 所有外部連結加 `rel="noopener noreferrer"`
- 任何 PR 必須通過七重審查（六重本地 + Copilot 雲端）
- 詳見 `.github/copilot-instructions.md`

## 授權

© Runners House. All rights reserved.
