/**
 * i18n 工具函式
 *
 * 提供以下能力：
 *  - useTranslations(locale)：取得指定語系的翻譯函式 t(key, params?)
 *  - detectLocale(pathname)：依路徑判斷使用者語系
 *  - getLocalizedPath(path, locale)：套用 / 移除語系前綴
 *  - getAlternateLocaleUrl(currentPath, targetLocale)：產生 hreflang 對等連結
 *
 * 設計原則：
 *  - 缺 key 時先 fallback 至 zh-TW，再缺則回傳 key 並 console.warn
 *  - en 一律以 `/en` 為前綴，zh-TW（預設）不加前綴
 *  - placeholder 採 `{name}` 樣式
 */
import zhTW from './zh-TW';
import en from './en';
import { DEFAULT_LOCALE, type Locale } from './types';

const dictionaries: Record<Locale, unknown> = {
  'zh-TW': zhTW,
  en,
};

/** 翻譯函式型別。params 可選，皆為字串對應的鍵值對。 */
export type TranslateFn = (key: string, params?: Readonly<Record<string, string | number>>) => string;

/**
 * 依 key 路徑（如 `nav.home`）從字典物件取出葉節點字串。
 * 找不到或型別不對則回傳 undefined，留給呼叫端決定 fallback 策略。
 */
function lookup(dict: unknown, key: string): string | undefined {
  if (!key) {
    return undefined;
  }
  const segments = key.split('.');
  let cursor: unknown = dict;
  for (const segment of segments) {
    if (typeof cursor !== 'object' || cursor === null) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
    if (cursor === undefined) {
      return undefined;
    }
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * 將字串中的 `{key}` 替換為 params 對應值。
 * 若 params 內無對應 key，保留原樣以利除錯。
 */
function interpolate(template: string, params?: Readonly<Record<string, string | number>>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(params, name)) {
      return String(params[name]);
    }
    return match;
  });
}

/**
 * 建立指定語系的翻譯函式。
 *
 * 缺 key 流程：
 *   1. 從 `locale` 字典找；找到則回傳。
 *   2. 找不到 → 從 `zh-TW` 字典找；找到則 console.warn 並回傳。
 *   3. 仍找不到 → console.warn 並回傳原 key（避免畫面崩壞）。
 */
export function useTranslations(locale: Locale): TranslateFn {
  const primary = dictionaries[locale];
  const fallback = dictionaries[DEFAULT_LOCALE];

  return (key, params) => {
    if (!key) {
      console.warn('[i18n] 收到空字串 key，回傳空字串');
      return '';
    }
    const direct = lookup(primary, key);
    if (direct !== undefined) {
      return interpolate(direct, params);
    }
    const fallbackValue = lookup(fallback, key);
    if (fallbackValue !== undefined) {
      console.warn(`[i18n] locale=${locale} 缺少 key "${key}"，已 fallback 至 ${DEFAULT_LOCALE}`);
      return interpolate(fallbackValue, params);
    }
    console.warn(`[i18n] 找不到 key "${key}"（locale=${locale}），回傳 key 本身`);
    return key;
  };
}

/**
 * 依 pathname 判斷語系。
 * 規則：以 `/en` 或 `/en/` 開頭視為 en；其餘一律視為 zh-TW。
 */
export function detectLocale(pathname: string): Locale {
  if (!pathname) {
    return DEFAULT_LOCALE;
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return 'en';
  }
  return DEFAULT_LOCALE;
}

/**
 * 確保路徑以單一斜線開頭，避免拼接結果出現 `//`。
 */
function normalizePath(path: string): string {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * 移除路徑開頭的 `/en` 前綴，根路徑時回傳 `/`。
 */
function stripEnglishPrefix(path: string): string {
  if (path === '/en') {
    return '/';
  }
  if (path.startsWith('/en/')) {
    return path.slice(3) || '/';
  }
  return path;
}

/**
 * 將任意路徑轉換為指定語系的合法路徑：
 *   - zh-TW：移除 `/en` 前綴，不再加任何前綴
 *   - en：確保開頭為 `/en`
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  const normalized = normalizePath(path);
  const bare = stripEnglishPrefix(normalized);
  if (locale === 'zh-TW') {
    return bare;
  }
  if (bare === '/') {
    return '/en';
  }
  return `/en${bare}`;
}

/**
 * 產生「同一頁但切換語系」的對等 URL。
 * 例：currentPath=`/about`、target=en → `/en/about`
 *     currentPath=`/en/about`、target=zh-TW → `/about`
 */
export function getAlternateLocaleUrl(currentPath: string, targetLocale: Locale): string {
  return getLocalizedPath(currentPath, targetLocale);
}
