# GitHub Copilot 審核指引 — Runners House 民宿網站

## 專案背景

本專案是台東長濱「跑者之家 Runners House」民宿官方網站，使用 Astro 6 + Tailwind CSS 4 + 中英雙語（zh-TW / en）。所有審核回饋一律以**繁體中文 zh-TW** 撰寫。

## 設計與架構原則

1. **設計系統雙軌**：首頁採海洋運動風（ocean / sand 色系），內頁採日系侘寂風（timber 色系）。任何顏色都必須使用 `src/styles/global.css` 中定義的 design tokens，禁止使用魔術數字或硬編碼顏色。
2. **元件單一職責**：每個 `.astro` 元件只做一件事，超過 200 行考慮拆分。
3. **無客戶端 JS 優先**：Astro 預設靜態，禁止毫無理由地加上 `client:*` 指令。互動元件需明確說明為何需要客戶端 hydration。
4. **i18n 完整性**：任何使用者可見字串都必須走 `src/i18n` 翻譯系統，禁止寫死中文或英文字串於元件中。
5. **無障礙 A11y**：所有圖片必須有 `alt`、所有互動元件必須鍵盤可達、色彩對比必須符合 WCAG 2.1 AA。

## 嚴重度分級

審核時依下列四級標註問題：

- **P0 阻擋（Blocker）**：安全漏洞、隱私洩漏、壞掉的功能、SEO 嚴重問題、無障礙阻擋。必須立即修復。
- **P1 高（High）**：邏輯錯誤、效能問題、SOLID 違反、明顯違反設計系統、可訪問性問題。必須修復。
- **P2 中（Medium）**：可維護性、命名、重複程式碼、註解不足。必須修復。
- **P3 低（Low）**：風格、格式、微小最佳化。**仍須修復至零**（本專案零容忍）。

## 必查項目

- 是否有硬編碼的密鑰、token、API key
- 是否有 `console.log`、`debugger`、`TODO`、`FIXME` 殘留
- 是否所有外部連結都有 `rel="noopener noreferrer"` 與適當 `target`
- 圖片是否使用 Astro `<Image>` 元件並提供尺寸與格式
- 是否有未使用的 import / 變數 / props
- 表單是否有伺服器端驗證（即使是靜態網站的 contact form 也要走可驗證的端點）
- LINE / 電話 / Email CTA 是否都使用正確的 `tel:` `mailto:` `https://line.me` 連結
- SEO meta、Open Graph、Schema.org（LodgingBusiness）是否完整
- 多語言切換是否保留當前頁面路徑

## 嚴禁事項

- 禁止 `alert()` / `confirm()` / `prompt()`
- 禁止 inline style（除非有充分理由並加註解）
- 禁止 `any` 型別
- 禁止 `// @ts-ignore` 與 `// @ts-expect-error`（除非附上 issue 連結說明）
- 禁止英文或簡體中文的內容字串（程式碼識別字除外）
- 禁止 mock / placeholder 殘留於 production build
