/**
 * 導覽連結資料
 *
 * Header / MobileMenu / Footer 共用的連結清單，
 * 避免三處各自維護一份相同的陣列。
 */
import { getLocalizedPath } from '@/i18n/utils';
import type { Locale } from '@/i18n/types';

/**
 * 主導覽允許使用的字典 key 收斂為 union。
 *
 * 把這些 key 收窄成 union 是為了：
 *   1. 在型別層阻擋打錯字典 key（如 `nav.aboot`）
 *   2. 一旦字典刪除某個 nav 字串，TS 立即拒絕通過
 *   3. 與 `i18n/utils.ts` 的 `TranslateFn` 寬鬆 string 形成「整體寬鬆，重點窄化」的策略
 */
export type NavKey =
  | 'nav.home'
  | 'nav.about'
  | 'nav.rooms'
  | 'nav.runners'
  | 'nav.charging'
  | 'nav.nearby'
  | 'nav.contact';

/**
 * 介面控制元件（行動選單漢堡按鈕等）使用的字典 key 收斂 union。
 *
 * 與 `NavKey` 拆開的理由：
 *   - NavKey 對應頁面導覽連結（會出現在 sitemap 結構）
 *   - UiKey 對應「介面控制」標籤，僅用於 aria-label / visually-hidden 提示
 *   分開語意有助於後續若需做 i18n key 完整性掃描時可獨立報表。
 */
export type UiKey = 'nav.menuOpen' | 'nav.menuClose';

/**
 * 取得「UI 控制元件」翻譯字串的型別守門 helper。
 *
 * 為何要包一層：
 *   `useTranslations` 回傳的 `TranslateFn` 接受寬鬆 `string`，
 *   會讓 `t('nav.menuOpne')`（typo）這類 bug 漏到 runtime；
 *   `tUi` 將 key 限縮為 `UiKey` union，typo 在編譯期即被 TS 攔截。
 *
 * @param t   useTranslations(locale) 回傳的翻譯函式
 * @param key 必須為 UiKey union 內合法字串
 */
export function tUi(
  t: (key: string) => string,
  key: UiKey,
): string {
  return t(key);
}

export interface NavItem {
  /** 翻譯 key（如 `nav.about`），由元件呼叫 t(key) 取得文字 */
  key: NavKey;
  /** 原始路徑（不含語系前綴），如 `/about` */
  path: string;
}

/**
 * 主導覽連結（不含首頁）。
 * Header 桌面版導覽列和 Footer 快速連結使用此清單。
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'nav.about', path: '/about' },
  { key: 'nav.rooms', path: '/rooms' },
  { key: 'nav.runners', path: '/runners' },
  { key: 'nav.charging', path: '/charging' },
  { key: 'nav.nearby', path: '/nearby' },
  { key: 'nav.contact', path: '/contact' },
] as const;

/**
 * 行動選單連結（含首頁）。
 * MobileMenu 需要在清單最前面放首頁連結。
 */
export const MOBILE_NAV_ITEMS: readonly NavItem[] = [
  { key: 'nav.home', path: '/' },
  ...NAV_ITEMS,
] as const;

/**
 * 將 NavItem 陣列轉換為帶有完整語系化 href 的物件陣列。
 *
 * @param items  原始 NavItem 陣列（路徑為不含語系前綴的形式）
 * @param locale 目標語系，用於決定是否加上 `/en` 前綴
 * @returns      含 `href` 與字典 `key` 的物件陣列，順序與輸入一致
 */
export function resolveNavHrefs(
  items: readonly NavItem[],
  locale: Locale,
): Array<{ href: string; key: NavKey }> {
  return items.map((item) => ({
    href: getLocalizedPath(item.path, locale),
    key: item.key,
  }));
}
