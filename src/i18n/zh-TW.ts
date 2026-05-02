/**
 * 繁體中文字典（預設語系）
 *
 * 自 CMS 整合後，內容真相搬到 `src/content/strings/zh-TW.json`，
 * 業主透過 /admin 後台編輯時直接寫到該 JSON，網站 build 時即時生效。
 *
 * 本檔僅作為 thin wrapper：剝除 CMS 用的 `locale` 識別欄位後將其餘 namespace 物件作為字典輸出。
 * 字典結構規範與 en 對等性檢查仍由 `tests/unit/i18n.test.ts` 守門。
 */
import strings from '../content/strings/zh-TW.json';

const { locale: _locale, ...zhTW } = strings;

export default zhTW;

/** 字典結構型別 — 從預設語系（zh-TW）的 JSON 結構推斷。 */
export type Dictionary = typeof zhTW;
