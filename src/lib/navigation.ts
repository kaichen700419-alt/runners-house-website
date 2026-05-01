/**
 * 導覽連結資料
 *
 * Header / MobileMenu / Footer 共用的連結清單，
 * 避免三處各自維護一份相同的陣列。
 */
import { getLocalizedPath } from '@/i18n/utils';
import type { Locale } from '@/i18n/types';

export interface NavItem {
  /** 翻譯 key（如 `nav.about`），由元件呼叫 t(key) 取得文字 */
  key: string;
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
 */
export function resolveNavHrefs(
  items: readonly NavItem[],
  locale: Locale,
): Array<{ href: string; key: string }> {
  return items.map((item) => ({
    href: getLocalizedPath(item.path, locale),
    key: item.key,
  }));
}
