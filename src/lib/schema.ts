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
 */
import { ADDRESS, AMENITIES, CONTACT, GEO, HOURS, SITE } from './site';
import type { Locale } from '@/i18n/types';

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
 * 產生 LodgingBusiness JSON-LD。
 * 包含 amenityFeature、postalAddress、geo、checkin/out 時間等核心欄位。
 */
export function lodgingBusinessSchema(input: LodgingBusinessInput): Record<string, unknown> {
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
 */
export function breadcrumbSchema(items: ReadonlyArray<BreadcrumbItem>): Record<string, unknown> {
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
 */
export function websiteSchema(locale: Locale): Record<string, unknown> {
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
