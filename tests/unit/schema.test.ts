/**
 * lib/schema.ts 單元測試
 *
 * 覆蓋：
 *  - lodgingBusinessSchema：中英 locale、URL 必須絕對、imageUrl 必須絕對、必填欄位
 *  - breadcrumbSchema：itemListElement 結構、空欄位 throw、空陣列退化
 *  - websiteSchema：inLanguage、publisher、@id
 */
import { describe, expect, it } from 'vitest';
import {
  breadcrumbSchema,
  lodgingBusinessSchema,
  websiteSchema,
} from '@/lib/schema';
import { ADDRESS, CONTACT, GEO, HOURS, SITE } from '@/lib/site';

describe('lodgingBusinessSchema', () => {
  const validInput = {
    locale: 'zh-TW' as const,
    url: 'https://runnershouse.tw/',
    description: '描述文字',
    imageUrl: 'https://runnershouse.tw/og.jpg',
  };

  it('產出含 @context、@type、@id、必填欄位的 schema', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('LodgingBusiness');
    expect(result['@id']).toBe(`${SITE.url}#lodging`);
    expect(result.url).toBe(validInput.url);
    expect(result.description).toBe(validInput.description);
    expect(result.image).toBe(validInput.imageUrl);
    expect(result.telephone).toBe(CONTACT.phone);
    expect(result.email).toBe(CONTACT.email);
    expect(result.checkinTime).toBe(HOURS.checkin);
    expect(result.checkoutTime).toBe(HOURS.checkout);
  });

  it('zh-TW 使用中文名稱與中文地址', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(result.name).toBe(SITE.nameZh);
    const address = result.address as Record<string, string>;
    expect(address.streetAddress).toBe(ADDRESS.streetZh);
    expect(address.addressLocality).toBe(ADDRESS.cityZh);
    expect(address.addressRegion).toBe(ADDRESS.regionZh);
    expect(address.addressCountry).toBe(ADDRESS.countryZh);
  });

  it('en 使用英文名稱與英文地址', () => {
    const result = lodgingBusinessSchema({ ...validInput, locale: 'en' });
    expect(result.name).toBe(SITE.nameEn);
    const address = result.address as Record<string, string>;
    expect(address.streetAddress).toBe(ADDRESS.streetEn);
    expect(address.addressLocality).toBe(ADDRESS.cityEn);
    expect(address.addressRegion).toBe(ADDRESS.regionEn);
    expect(address.addressCountry).toBe(ADDRESS.countryEn);
  });

  it('geo 經緯度直接來自 GEO 常數', () => {
    const result = lodgingBusinessSchema(validInput);
    const geo = result.geo as Record<string, unknown>;
    expect(geo['@type']).toBe('GeoCoordinates');
    expect(geo.latitude).toBe(GEO.latitude);
    expect(geo.longitude).toBe(GEO.longitude);
  });

  it('amenityFeature 包含全部設施條目', () => {
    const result = lodgingBusinessSchema(validInput);
    const amenities = result.amenityFeature as Array<Record<string, unknown>>;
    expect(amenities.length).toBeGreaterThanOrEqual(6);
    for (const a of amenities) {
      expect(a['@type']).toBe('LocationFeatureSpecification');
      expect(typeof a.name).toBe('string');
      expect(a.value).toBe(true);
    }
  });

  it('sameAs 陣列含 Facebook / Instagram / LINE', () => {
    const result = lodgingBusinessSchema(validInput);
    const sameAs = result.sameAs as string[];
    expect(sameAs).toContain(CONTACT.facebookUrl);
    expect(sameAs).toContain(CONTACT.instagramUrl);
    expect(sameAs).toContain(CONTACT.lineUrl);
  });

  it('url 為相對路徑時 throw', () => {
    expect(() =>
      lodgingBusinessSchema({ ...validInput, url: '/about' }),
    ).toThrow(/url 必須為含 protocol 的絕對 URL/);
  });

  it('url 為空字串時 throw', () => {
    expect(() => lodgingBusinessSchema({ ...validInput, url: '' })).toThrow(
      /url 必須為含 protocol 的絕對 URL/,
    );
  });

  it('imageUrl 為相對路徑時 throw', () => {
    expect(() =>
      lodgingBusinessSchema({ ...validInput, imageUrl: '/og.jpg' }),
    ).toThrow(/imageUrl 必須為含 protocol 的絕對 URL/);
  });

  it('http:// 也視為合法絕對 URL（給開發環境用）', () => {
    expect(() =>
      lodgingBusinessSchema({
        ...validInput,
        url: 'http://localhost:4321/',
        imageUrl: 'http://localhost:4321/og.jpg',
      }),
    ).not.toThrow();
  });
});

describe('breadcrumbSchema', () => {
  it('產出標準 BreadcrumbList 結構', () => {
    const items = [
      { name: '首頁', url: 'https://runnershouse.tw/' },
      { name: '品牌故事', url: 'https://runnershouse.tw/about' },
    ];
    const result = breadcrumbSchema(items);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BreadcrumbList');
    const list = result.itemListElement as Array<Record<string, unknown>>;
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: '首頁',
      item: 'https://runnershouse.tw/',
    });
    expect(list[1].position).toBe(2);
  });

  it('空 items 陣列產出空 itemListElement（合法但通常不該發生）', () => {
    const result = breadcrumbSchema([]);
    expect(result.itemListElement).toEqual([]);
  });

  it('name 為空字串時 throw', () => {
    expect(() =>
      breadcrumbSchema([
        { name: '', url: 'https://runnershouse.tw/' },
      ]),
    ).toThrow(/name\/url 不得為空白/);
  });

  it('name 全為空白時 throw', () => {
    expect(() =>
      breadcrumbSchema([
        { name: '   ', url: 'https://runnershouse.tw/' },
      ]),
    ).toThrow(/name\/url 不得為空白/);
  });

  it('url 為空字串時 throw', () => {
    expect(() =>
      breadcrumbSchema([{ name: '首頁', url: '' }]),
    ).toThrow(/name\/url 不得為空白/);
  });

  it('多層 breadcrumb 的 position 由 1 遞增', () => {
    const items = [
      { name: '首頁', url: 'https://runnershouse.tw/' },
      { name: '房型', url: 'https://runnershouse.tw/rooms' },
      { name: '海景房', url: 'https://runnershouse.tw/rooms/sea-view' },
    ];
    const result = breadcrumbSchema(items);
    const list = result.itemListElement as Array<{ position: number }>;
    expect(list.map((l) => l.position)).toEqual([1, 2, 3]);
  });

  it('item.url 為相對路徑時 throw（Google Rich Results 拒收相對 URL）', () => {
    expect(() =>
      breadcrumbSchema([
        { name: '首頁', url: 'https://runnershouse.tw/' },
        { name: '品牌故事', url: '/about' },
      ]),
    ).toThrow(/breadcrumbSchema\[1\]\.url 必須為含 protocol 的絕對 URL/);
  });

  it('item.url 為非 http(s) 協定時 throw（如 ftp://、file://）', () => {
    expect(() =>
      breadcrumbSchema([
        { name: '首頁', url: 'ftp://runnershouse.tw/' },
      ]),
    ).toThrow(/breadcrumbSchema\[0\]\.url 必須為含 protocol 的絕對 URL/);
  });

  it('合法絕對 URL 通過驗證', () => {
    expect(() =>
      breadcrumbSchema([
        { name: '首頁', url: 'https://runnershouse.tw/' },
        { name: '品牌故事', url: 'https://runnershouse.tw/about' },
      ]),
    ).not.toThrow();
  });
});

describe('websiteSchema', () => {
  it('zh-TW 使用中文名稱與 zh-Hant-TW inLanguage', () => {
    const result = websiteSchema('zh-TW');
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('WebSite');
    expect(result['@id']).toBe(`${SITE.url}#website`);
    expect(result.url).toBe(SITE.url);
    expect(result.name).toBe(SITE.nameZh);
    expect(result.inLanguage).toBe('zh-Hant-TW');
    const publisher = result.publisher as Record<string, string>;
    expect(publisher['@type']).toBe('Organization');
    expect(publisher.name).toBe(SITE.nameZh);
    expect(publisher.url).toBe(SITE.url);
  });

  it('en 使用英文名稱與 en inLanguage', () => {
    const result = websiteSchema('en');
    expect(result.name).toBe(SITE.nameEn);
    expect(result.inLanguage).toBe('en');
    const publisher = result.publisher as Record<string, string>;
    expect(publisher.name).toBe(SITE.nameEn);
  });
});
