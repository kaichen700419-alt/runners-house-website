/**
 * Schema.org JSON-LD 產生器
 *
 * 提供：
 *  - lodgingBusinessSchema(input)：跑者之家 LodgingBusiness 主資料
 *  - breadcrumbSchema(items)：BreadcrumbList
 *  - websiteSchema(locale)：WebSite + 多語系版本資訊
 *
 * 設計原則：
 *  - 所有產出物為 plain object，由 <JsonLd /> 元件序列化為 <script type="application/ld+json">
 *  - 中英資訊由 site.ts 的 SITE / ADDRESS / GEO / HOURS / AMENITIES 單一真相提供
 *  - 入口參數做嚴格驗證（URL 必須絕對、breadcrumb 不允許空欄位），失敗時直接 throw
 */
import { ADDRESS, AMENITIES, CONTACT, GEO, HOURS, SITE } from './site';
import type { Locale } from '@/i18n/types';

/**
 * 通用 Schema.org JSON-LD 物件型別。
 *
 * 用 `Record<string, unknown>` 而非更嚴格的 union，
 * 因 schema.org 物件本質上是動態 key/value，且需在多處（schema.ts、JsonLd.astro、BaseLayout.astro）
 * 共用同一型別別名以避免「三處各定義一份相同 shape」的漂移。
 *
 * 序列化警示：此物件最終會傳入 `JSON.stringify`，故葉節點僅可放入 JSON 可序列化值
 * （string / number / boolean / null / 陣列 / plain object）。**禁止**放入：
 *   - `undefined`（會被 stringify 直接吞掉，造成欄位靜默消失）
 *   - `bigint`（stringify 會 throw TypeError）
 *   - `function`（會被 stringify 直接吞掉）
 *   - `Symbol`（會被 stringify 直接吞掉）
 *   - 含循環引用的物件（stringify 會 throw TypeError）
 */
export type SchemaObject = Record<string, unknown>;

export interface BreadcrumbItem {
  /** 顯示名稱 */
  name: string;
  /** 完整 URL（含 protocol） */
  url: string;
}

export interface LodgingBusinessInput {
  locale: Locale;
  /** 頁面對應的 canonical URL（含 protocol） */
  url: string;
  /** 頁面 description（用於 schema.description） */
  description: string;
  /** 頁面預設社群圖完整 URL */
  imageUrl: string;
}

/** 依語系選取中文或英文欄位值 */
function pick<T>(locale: Locale, zh: T, en: T): T {
  return locale === 'en' ? en : zh;
}

/**
 * 驗證入口字串為以 http(s) 開頭的絕對 URL。
 * 用於 schema 的 url / image 欄位，避免 Google Rich Results 因相對 URL 而拒收。
 *
 * 採 `asserts value is string` 簽章：
 *   - 通過後呼叫端可保證 `value` 為「非空、含 protocol 的合法絕對 URL 字串」
 *   - 在型別層面表達「驗證即守門」，下游使用時不必再 narrow
 *
 * @throws Error 當 value 為空字串、或不以 http:// / https:// 開頭時
 */
function assertAbsoluteUrl(
  value: string,
  fieldName: string,
): asserts value is string {
  if (!value || !/^https?:\/\//.test(value)) {
    throw new Error(
      `[schema] ${fieldName} 必須為含 protocol 的絕對 URL（如 https://…），實際收到「${value}」`,
    );
  }
}

/**
 * 產生 LodgingBusiness JSON-LD。
 * 包含 amenityFeature、postalAddress、geo、checkin/out 時間等核心欄位。
 *
 * @param input LodgingBusinessInput；url、imageUrl 必須為絕對 URL
 * @returns     可序列化為 JSON-LD 的 SchemaObject
 * @throws      Error 當 url 或 imageUrl 非絕對 URL
 */
export function lodgingBusinessSchema(input: LodgingBusinessInput): SchemaObject {
  assertAbsoluteUrl(input.url, 'lodgingBusinessSchema.url');
  assertAbsoluteUrl(input.imageUrl, 'lodgingBusinessSchema.imageUrl');

  const { locale } = input;
  const name = pick(locale, SITE.nameZh, SITE.nameEn);
  const address = {
    '@type': 'PostalAddress',
    streetAddress: pick(locale, ADDRESS.streetZh, ADDRESS.streetEn),
    addressLocality: pick(locale, ADDRESS.cityZh, ADDRESS.cityEn),
    addressRegion: pick(locale, ADDRESS.regionZh, ADDRESS.regionEn),
    postalCode: ADDRESS.postalCode,
    addressCountry: pick(locale, ADDRESS.countryZh, ADDRESS.countryEn),
  };
  const amenityFeature = AMENITIES.map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: pick(locale, a.zh, a.en),
    value: true,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${SITE.url}#lodging`,
    name,
    description: input.description,
    url: input.url,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    image: input.imageUrl,
    address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    checkinTime: HOURS.checkin,
    checkoutTime: HOURS.checkout,
    amenityFeature,
    sameAs: [CONTACT.facebookUrl, CONTACT.instagramUrl, CONTACT.lineUrl],
  };
}

/**
 * 產生 BreadcrumbList JSON-LD。
 * 第一個項目通常為「首頁」，最後一項為當前頁面。
 *
 * @param items 麵包屑陣列；每項 name、url 皆不得為空白字串，且 url 必須為絕對 URL
 * @returns     可序列化為 JSON-LD 的 SchemaObject
 * @throws      Error 當任一項目 name 或 url 為空 / 全空白；或 url 非絕對 URL
 */
export function breadcrumbSchema(
  items: ReadonlyArray<BreadcrumbItem>,
): SchemaObject {
  // BreadcrumbItem.name / url 在型別層皆為 string（非 optional），
  // 故此處用 `!item.name.trim()` 而非 `!item.name?.trim()`，避免多餘 optional chaining
  // 給人 name/url 可能為 undefined 的誤導。
  items.forEach((item, i) => {
    if (!item.name.trim() || !item.url.trim()) {
      throw new Error(
        `[schema] breadcrumbSchema 第 ${i} 項 name/url 不得為空白`,
      );
    }
    // url 不僅要非空，還必須是含 protocol 的絕對 URL，
    // 否則 Google Rich Results 會將整個 BreadcrumbList 視為無效並拒收。
    assertAbsoluteUrl(item.url, `breadcrumbSchema[${i}].url`);
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 產生 WebSite JSON-LD（含跨語系版本資訊）。
 *
 * @param locale 當前頁面語系
 * @returns      可序列化為 JSON-LD 的 SchemaObject
 */
export function websiteSchema(locale: Locale): SchemaObject {
  const name = pick(locale, SITE.nameZh, SITE.nameEn);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name,
    inLanguage: pick(locale, 'zh-Hant-TW', 'en'),
    publisher: {
      '@type': 'Organization',
      name,
      url: SITE.url,
    },
  };
}
