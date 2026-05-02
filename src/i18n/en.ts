/**
 * 英文字典
 *
 * 自 CMS 整合後，內容真相搬到 `src/content/strings/en.json`，
 * 業主透過 /admin 後台編輯時直接寫到該 JSON。
 *
 * 本檔僅作為 thin wrapper：剝除 CMS 用的 `locale` 識別欄位後輸出。
 * 必須與 src/i18n/zh-TW.ts 維持完全一致的 key 樹（i18n.test.ts 強制檢查）。
 */
import type { Dictionary } from './zh-TW';
import strings from '../content/strings/en.json';

const { locale: _locale, ...en } = strings;

export default en as Dictionary;
