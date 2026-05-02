# 跑者之家民宿｜內容後台使用指引

## 後台網址

**👉 https://kaichen700419-alt.github.io/runners-house-website/admin/**

## 第一次登入準備（只做一次，5 分鐘完成）

### 步驟 1：申請 GitHub Personal Access Token (PAT)

1. 用業主的 GitHub 帳號登入 [https://github.com](https://github.com)
2. 開啟 [Personal Access Tokens (Fine-grained) 申請頁](https://github.com/settings/personal-access-tokens/new)
3. **Token name**：填 `runners-house-cms`
4. **Expiration**：建議選「No expiration」永久有效
5. **Repository access**：選 `Only select repositories`，勾選 `kaichen700419-alt/runners-house-website`
6. **Permissions**：點開 `Repository permissions`，把以下 3 項改為「Read and write」：
   - `Contents`（修改檔案）
   - `Pull requests`（自動 commit）
   - `Metadata`（讀取 repo 資訊，預設已選）
7. 拉到最底點 **Generate token**，立即複製出現的 token（格式為 `github_pat_...`），貼到記事本暫存

### 步驟 2：登入後台

1. 開啟後台網址 https://kaichen700419-alt.github.io/runners-house-website/admin/
2. Sveltia CMS 登入畫面選 `Personal Access Token`
3. 貼上剛剛複製的 token
4. 進入後台

## 後台可編輯的內容類別

| 類別 | 可做什麼 | 編輯後生效時間 |
|------|---------|---------------|
| 🛏️ **房型** | 修改房型描述、價格說明、設施清單；上傳/換房型照片 | 約 1-2 分鐘 |
| 🏃 **馬拉松賽事** | 新增/修改/刪除賽事資料 | 約 1-2 分鐘 |
| 🏞️ **晨跑路線** | 修改路線描述、距離、地圖連結 | 約 1-2 分鐘 |
| 🌊 **周邊景點** | 新增/修改景點介紹、距離、地圖 | 約 1-2 分鐘 |
| 🍱 **周邊餐廳** | 新增/修改推薦餐廳資料 | 約 1-2 分鐘 |
| 📝 **網站文字內容** | 修改首頁/關於/聯絡等所有頁面文案（中文 + 英文兩個版本） | 約 1-2 分鐘 |

## 上傳房型照片

1. 在房型編輯頁面點「房型照片」區塊
2. 點 `+ 新增` 拖曳照片進去（建議 JPG/WebP，寬度至少 1200px）
3. 系統自動將照片上傳到 `public/uploads/`
4. 多張照片可拖曳排序
5. 點「儲存」即完成

## 修改文字內容（中英對照）

1. 進入「網站文字內容」 → 選 `zh-TW` 編輯中文、選 `en` 編輯英文
2. 編輯時請務必兩邊同步修改（網站會自動檢查 key 對齊）
3. 儲存後自動 commit

## 注意事項

- ✅ **每次儲存都會自動 commit 到 GitHub** → gh-pages 自動 rebuild → 約 1-2 分鐘後網站更新
- ⚠️ **房型不可刪除**（防止誤操作），如需移除請聯絡開發者
- ⚠️ **`網址識別碼` 欄位建立後請勿修改**（會破壞 SEO 連結）
- ⚠️ **照片建議**：寬度 ≥ 1200px、檔案大小 < 500KB（避免拖慢網站）
- 🔒 **PAT 請保管好**，不要分享給任何人；若洩漏立即至 GitHub 撤銷重發

## 常見問題

**Q：編輯後網站沒立即更新？**
A：gh-pages 部署需 1-2 分鐘，請耐心等待後重新整理瀏覽器（按 Cmd+Shift+R 強制清除快取）。

**Q：上傳的照片在後台預覽看不到？**
A：第一次上傳的照片需要等網站 rebuild 後才能在前台顯示，但後台預覽應該即時可見。若仍看不到請重新整理頁面。

**Q：登入時跳出「authentication failed」？**
A：檢查 PAT 是否過期或權限不足。重新申請一個新 PAT 並確認三項權限都選了「Read and write」。

**Q：可以多人同時編輯嗎？**
A：可以。每個人申請自己的 PAT 登入即可。但建議避免同時編輯同一筆資料以免 commit conflict。

**Q：誤刪了內容怎麼辦？**
A：所有變更都有 GitHub commit 紀錄，可至 [Repository Commits](https://github.com/kaichen700419-alt/runners-house-website/commits/main) 找到上一版內容請開發者復原。
