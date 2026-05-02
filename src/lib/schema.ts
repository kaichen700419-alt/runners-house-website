/**
 * Schema.org JSON-LD 產生器
 *
 * 提供：
 *  - lodgingBusinessSchema(input)：跑者之家 LodgingBusiness 主資料（完整欄位）
 *  - breadcrumbSchema(items)：BreadcrumbList
 *  - websiteSchema(locale)：WebSite + 多語系 + SearchAction
 *  - faqPageSchema(items, locale)：FAQPage
 *
 * 設計原則：
 *  - 所有產出物為 plain object，由 <JsonLd /> 元件序列化為 <script type="application/ld+json">
 *  - 中英資訊由 site.ts 的 SITE / ADDRESS / GEO / HOURS / AMENITIES / POLICY / PAYMENT / LANGUAGES 等
 *    單一真相提供，避免「中英顯示不同電話 / 地址」之雙真相 bug
 *  - 入口參數做嚴格驗證（URL 必須絕對、breadcrumb 不允許空欄位、FAQ 不允許空題答），失敗時直接 throw
 *  - 雙語對等：所有 schema 必含 inLanguage 欄位（zh-TW → 'zh-Hant-TW'，en → 'en'）
 */
import {
  ADDRESS,
  AMENITIES,
  CONTACT,
  GEO,
  HOURS,
  LANGUAGES,
  NUMBER_OF_ROOMS,
  PAYMENT,
  POLICY,
  SITE,
} from './site';
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

/**
 * FAQ 單題：question 為題目、answer 為純文字答案（answer 內可含換行；HTML 不建議）。
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/** 依語系選取中文或英文欄位值 */
function pick<T>(locale: Locale, zh: T, en: T): T {
  return locale === 'en' ? en : zh;
}

/** 依語系回傳 schema 慣用 inLanguage 標籤（zh-TW → 'zh-Hant-TW'；en → 'en'）。 */
function inLanguageTag(locale: Locale): string {
  return locale === 'en' ? 'en' : 'zh-Hant-TW';
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
 * 產生 LodgingBusiness JSON-LD（完整版）。
 *
 * 包含：
 *  - 基本識別：@id / name / alternateName / description / url / logo / image / inLanguage
 *  - 完整 PostalAddress（含 streetAddress、addressLocality、addressRegion、postalCode、addressCountry ISO TW）
 *  - GeoCoordinates（latitude / longitude）
 *  - 聯絡：telephone / email
 *  - 入住規則：checkinTime / checkoutTime（schema.org 接受 HH:mm，Google 偏好 ISO 8601 時間，但 24 小時 HH:mm 亦合法）
 *  - 房型規模：numberOfRooms（與 src/content/rooms 數量保持一致）
 *  - 政策：petsAllowed / smokingAllowed
 *  - 付款：paymentAccepted / currenciesAccepted / priceRange
 *  - 服務語言：availableLanguage 陣列
 *  - 設施：amenityFeature 陣列（LocationFeatureSpecification）
 *  - 社群：sameAs 陣列
 *  - 機構連結 hasMap（指向 Google Maps，幫助 Google 直接定位地理實體）
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
  const alternateName = pick(locale, SITE.alternateNameEn, SITE.alternateNameZh);
  const address = {
    '@type': 'PostalAddress',
    streetAddress: pick(locale, ADDRESS.streetZh, ADDRESS.streetEn),
    addressLocality: pick(locale, ADDRESS.cityZh, ADDRESS.cityEn),
    addressRegion: pick(locale, ADDRESS.regionZh, ADDRESS.regionEn),
    postalCode: ADDRESS.postalCode,
    // schema.org 偏好 ISO 3166-1 alpha-2 國碼（"TW"）而非全名（"台灣" / "Taiwan"），
    // Google Maps 解析才能正確定位至國家層級
    addressCountry: ADDRESS.countryCode,
  };
  const amenityFeature = AMENITIES.map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: pick(locale, a.zh, a.en),
    value: true,
  }));
  // hasMap 指向 Google Maps；以經緯度為查詢字串以避開地址翻譯歧義
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${GEO.latitude}%2C${GEO.longitude}`;
  // availableLanguage：採陣列含每個 Language 物件，含 alternateName 利於 LLM 引用辨識
  const availableLanguage = LANGUAGES.map((lang) => ({
    '@type': 'Language',
    name: lang === 'en' ? 'English' : 'Traditional Chinese',
    alternateName: lang === 'en' ? 'en' : 'zh-Hant-TW',
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${SITE.url}#lodging`,
    name,
    alternateName,
    description: input.description,
    url: input.url,
    inLanguage: inLanguageTag(locale),
    telephone: CONTACT.phone,
    email: CONTACT.email,
    logo: input.imageUrl,
    image: input.imageUrl,
    address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    hasMap: mapUrl,
    checkinTime: HOURS.checkin,
    checkoutTime: HOURS.checkout,
    numberOfRooms: NUMBER_OF_ROOMS,
    petsAllowed: POLICY.petsAllowed,
    smokingAllowed: POLICY.smokingAllowed,
    priceRange: SITE.priceRange,
    paymentAccepted: pick(locale, PAYMENT.acceptedZh, PAYMENT.acceptedEn),
    currenciesAccepted: PAYMENT.currency,
    availableLanguage,
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
 * 產生 WebSite JSON-LD（含跨語系版本資訊與 SearchAction）。
 *
 * SearchAction 採 schema.org 推薦的 SearchAction + EntryPoint，
 * Google 解析後可在搜尋結果直接顯示站內搜尋框（Sitelinks Searchbox）。
 *
 * 若日後本站新增 /search?q= 端點，現有 target template 即可直接生效，
 * 不需 Google 重新審核 schema 結構。
 *
 * @param locale 當前頁面語系
 * @returns      可序列化為 JSON-LD 的 SchemaObject
 */
export function websiteSchema(locale: Locale): SchemaObject {
  const name = pick(locale, SITE.nameZh, SITE.nameEn);
  // SearchAction 的 target 必須包含 {search_term_string} placeholder
  // 即便目前站內未實作 /search 路由，先佈局可避免日後上線後仍須等待重新索引
  const searchTarget = `${SITE.url}/search?q={search_term_string}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name,
    inLanguage: inLanguageTag(locale),
    publisher: {
      '@type': 'Organization',
      name,
      url: SITE.url,
      logo: new URL(SITE.logo, SITE.url).toString(),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchTarget,
      },
      // schema.org 規範：query-input 必填，描述 SearchAction 對應的輸入變數名稱
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 產生 FAQPage JSON-LD。
 *
 * Google Rich Results 政策：
 *  - 每題 question / answer 內容必須與頁面可見 HTML 完全一致（含標點），否則 P1 警告
 *  - 答案不得為純行銷字眼或重複的 CTA，需提供實質回答
 *  - FAQ 必須對使用者實質有用，不可灌水
 *
 * @param items   FAQ 陣列；每題 question、answer 皆不得為空字串或全空白
 * @param locale  當前頁面語系（用於 inLanguage 標註）
 * @returns       可序列化為 JSON-LD 的 SchemaObject
 * @throws        Error 當 items 為空陣列、或任何題目/答案為空白
 */
export function faqPageSchema(
  items: ReadonlyArray<FaqItem>,
  locale: Locale,
): SchemaObject {
  if (items.length === 0) {
    throw new Error('[schema] faqPageSchema items 不得為空陣列');
  }
  items.forEach((item, i) => {
    if (!item.question.trim() || !item.answer.trim()) {
      throw new Error(
        `[schema] faqPageSchema 第 ${i} 題 question/answer 不得為空白`,
      );
    }
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: inLanguageTag(locale),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
