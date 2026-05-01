/**
 * i18n 型別定義
 *
 * 維護兩種語系：zh-TW（預設）與 en。
 * 翻譯字典使用「namespace.key」格式，namespace 對應頁面或元件區塊。
 */

export const LOCALES = ['zh-TW', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-TW';

/**
 * 判斷字串是否為合法 locale。
 */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
