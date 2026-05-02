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
 *  - 在 production build 階段（import.meta.env.PROD）：
 *      a. 兩字典都缺 `seo.*` key → throw
 *      b. 非預設 locale 缺 `seo.*` key 即便能 fallback 至 zh-TW 也 throw
 *         （SEO 字串語言錯亂會被 Google 錯誤索引並降權，屬靜默致命退化）
 *    其餘 key（如 nav、common）僅 console.warn，不阻斷建置
 *  - en 一律以 `/en` 為前綴，zh-TW（預設）不加前綴
 *  - placeholder 採 `{name}` 樣式
 */
import zhTW, { type Dictionary } from './zh-TW';
import en from './en';
import { DEFAULT_LOCALE, isLocale, type Locale } from './types';

/**
 * 字典集合：強型別，鎖死兩個語系都必須符合 Dictionary shape，
 * 從根本避免「字典放錯資料 / 多放一層」這類 bug 透過 unknown 漏掉編譯期檢查。
 */
const dictionaries: Record<Locale, Dictionary> = {
  'zh-TW': zhTW,
  en,
};

/**
 * 翻譯函式型別。
 *
 * 設計取捨：key 維持為 `string` 而非「所有葉節點 union」，
 * 原因：
 *   1. 葉節點 union 在含 200+ key 的字典上會劇烈拖慢 TS 推論
 *   2. 字典完整性已由 `tests/unit/i18n.test.ts` 強制檢查
 *   3. 高風險的 nav key 由 `src/lib/navigation.ts` 的 `NavKey` union 收斂守門
 *
 * @param key    點分隔字典 key 路徑（例：`nav.home`、`common.copyright`）
 * @param params 可選的插值物件，用於替換 key 對應字串中的 `{name}` 占位符
 * @returns      翻譯後字串；缺 key 時依 fallback 規則回傳
 */
export type TranslateFn = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;

/**
 * 依 key 路徑（如 `nav.home`）從字典物件取出葉節點字串。
 *
 * @param dict 字典根物件
 * @param key  點分隔 key 路徑
 * @returns    字串葉節點；找不到、空 key、或路徑指向非字串中間節點時回傳 undefined
 */
function lookup(dict: Dictionary, key: string): string | undefined {
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
function interpolate(
  template: string,
  params?: Readonly<Record<string, string | number>>,
): string {
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
 *   2. 找不到 → 從 `zh-TW` 字典找；
 *        - 若命中且 PROD + key 為 `seo.*` + locale 非預設語系 → throw（禁止 fallback）
 *        - 否則 console.warn 並回傳 fallback 值
 *   3. 兩字典都缺 → 在 production build（PROD）若 key 以 `seo.` 開頭，直接 throw
 *      使建置 fail-loud；否則僅 console.warn 並回傳原 key 以避免畫面崩壞。
 */
export function useTranslations(locale: Locale): TranslateFn {
  const primary = dictionaries[locale];
  const fallback = dictionaries[DEFAULT_LOCALE];

  return (key, params) => {
    if (!key) {
      // 空字串 key 通常為元件層誤算（例如 `t('' + maybeUndefined)`），
      // 在 PROD build 應 fail-loud 以利第一時間發現；dev 則 warn 不阻擋開發。
      if (import.meta.env.PROD) {
        throw new Error('[i18n] production build 收到空字串 key，建置中止');
      }
      console.warn('[i18n] 收到空字串 key，回傳空字串');
      return '';
    }
    const direct = lookup(primary, key);
    if (direct !== undefined) {
      return interpolate(direct, params);
    }
    const fallbackValue = lookup(fallback, key);
    if (fallbackValue !== undefined) {
      // PROD fail-loud：即便 fallback 命中，若當前 locale 非預設 locale 且為 SEO key，
      // 仍必須 throw。理由：英文頁面 fallback 至 zh-TW 會把中文 title/description 寫進
      // <head>，搜尋引擎讀到語言錯亂的字串會「錯誤索引」並降權整站；屬靜默致命退化，
      // 必須在 build 階段炸給工程師看到，禁止 fallback 通過。
      // 注意：非 seo.* key 缺失時退化為「顯示中文」雖不理想但仍可閱讀，可接受 fallback；
      //      SEO key 缺失會產出語言錯亂或空 meta 影響搜尋排名，屬零容忍。
      if (
        import.meta.env.PROD &&
        key.startsWith('seo.') &&
        locale !== DEFAULT_LOCALE
      ) {
        throw new Error(
          `[i18n] production build 缺少 SEO key "${key}"（locale=${locale}），禁止 fallback 至 ${DEFAULT_LOCALE}，建置中止`,
        );
      }
      console.warn(
        `[i18n] locale=${locale} 缺少 key "${key}"，已 fallback 至 ${DEFAULT_LOCALE}`,
      );
      return interpolate(fallbackValue, params);
    }
    // 兩字典皆缺：SEO key 在 production build 直接 throw，避免線上輸出空 title/description；
    // 非 seo.* key 缺失退化為顯示 key 字串可接受，SEO key 缺失會被 Google 降權，故 fail-loud。
    if (import.meta.env.PROD && key.startsWith('seo.')) {
      throw new Error(
        `[i18n] production build 缺少 SEO key "${key}"（locale=${locale}），建置中止`,
      );
    }
    console.warn(`[i18n] 找不到 key "${key}"（locale=${locale}），回傳 key 本身`);
    return key;
  };
}

/**
 * 依 pathname 判斷語系。
 * 規則：以 `/en` 或 `/en/` 開頭視為 en；其餘一律視為 zh-TW。
 *
 * 內部使用 `isLocale` 守門，確保未來若新增語系（zh-Hans 等）只需擴充 LOCALES，
 * 此函式即可自動受益於 type guard 的編譯期檢查。
 */
export function detectLocale(pathname: string): Locale {
  if (!pathname) {
    return DEFAULT_LOCALE;
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    // 透過 isLocale 雙重保險：避免未來常數變更但本函式忘記同步
    return isLocale('en') ? 'en' : DEFAULT_LOCALE;
  }
  return DEFAULT_LOCALE;
}

/**
 * 確保路徑以單一斜線開頭，避免拼接結果出現 `//`。
 *
 * 抽離成獨立函式而非 inline，是為了：
 *   1. 讓 `getLocalizedPath` 主流程聚焦於語系前綴邏輯
 *   2. 空字串、缺斜線、含查詢字串等邊界 case 集中於單一守門點
 */
function normalizePath(path: string): string {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * 移除路徑開頭的 `/en` 前綴，根路徑時回傳 `/`。
 *
 * 抽離原因：`getLocalizedPath` 對 zh-TW、en 兩條路徑都要先 strip 再決定加不加前綴，
 * 拆出此函式可避免兩處邏輯各自走樣。
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
export function getAlternateLocaleUrl(
  currentPath: string,
  targetLocale: Locale,
): string {
  return getLocalizedPath(currentPath, targetLocale);
}
