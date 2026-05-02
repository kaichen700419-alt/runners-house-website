/**
 * lib/schema.ts 單元測試
 *
 * 覆蓋：
 *  - lodgingBusinessSchema：中英 locale、URL 必須絕對、imageUrl 必須絕對、必填欄位、
 *                            完整欄位（numberOfRooms / petsAllowed / smokingAllowed /
 *                            paymentAccepted / currenciesAccepted / priceRange /
 *                            availableLanguage / hasMap / inLanguage / alternateName）
 *  - breadcrumbSchema：itemListElement 結構、空欄位 throw、空陣列退化
 *  - websiteSchema：inLanguage、publisher、@id、SearchAction
 *  - faqPageSchema：mainEntity 結構、空陣列 throw、空題答 throw、雙語 inLanguage
 *  - 雙語對等驗證：zh-TW 與 en 版本欄位數量與結構必對等
 */
import { describe, expect, it } from 'vitest';
import {
  breadcrumbSchema,
  faqPageSchema,
  lodgingBusinessSchema,
  websiteSchema,
} from '@/lib/schema';
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
} from '@/lib/site';

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
    expect(result.logo).toBe(validInput.imageUrl);
    expect(result.telephone).toBe(CONTACT.phone);
    expect(result.email).toBe(CONTACT.email);
    expect(result.checkinTime).toBe(HOURS.checkin);
    expect(result.checkoutTime).toBe(HOURS.checkout);
  });

  it('zh-TW 使用中文名稱、英文 alternateName 與中文地址', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(result.name).toBe(SITE.nameZh);
    // 中文版的 alternateName 提供英文，便於 Google / LLM 跨語言辨識為同一實體
    expect(result.alternateName).toBe(SITE.alternateNameEn);
    const address = result.address as Record<string, string>;
    expect(address.streetAddress).toBe(ADDRESS.streetZh);
    expect(address.addressLocality).toBe(ADDRESS.cityZh);
    expect(address.addressRegion).toBe(ADDRESS.regionZh);
    expect(address.addressCountry).toBe(ADDRESS.countryCode);
  });

  it('en 使用英文名稱、中文 alternateName 與英文地址', () => {
    const result = lodgingBusinessSchema({ ...validInput, locale: 'en' });
    expect(result.name).toBe(SITE.nameEn);
    expect(result.alternateName).toBe(SITE.alternateNameZh);
    const address = result.address as Record<string, string>;
    expect(address.streetAddress).toBe(ADDRESS.streetEn);
    expect(address.addressLocality).toBe(ADDRESS.cityEn);
    expect(address.addressRegion).toBe(ADDRESS.regionEn);
    // addressCountry 永遠為 ISO 代碼（雙語版本相同），避免 Google 解析國名差異
    expect(address.addressCountry).toBe(ADDRESS.countryCode);
  });

  it('inLanguage 隨 locale 切換為 zh-Hant-TW / en', () => {
    expect(lodgingBusinessSchema(validInput).inLanguage).toBe('zh-Hant-TW');
    expect(
      lodgingBusinessSchema({ ...validInput, locale: 'en' }).inLanguage,
    ).toBe('en');
  });

  it('geo 經緯度直接來自 GEO 常數', () => {
    const result = lodgingBusinessSchema(validInput);
    const geo = result.geo as Record<string, unknown>;
    expect(geo['@type']).toBe('GeoCoordinates');
    expect(geo.latitude).toBe(GEO.latitude);
    expect(geo.longitude).toBe(GEO.longitude);
  });

  it('hasMap 指向 Google Maps 並含經緯度查詢字串', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(typeof result.hasMap).toBe('string');
    expect(result.hasMap).toContain('google.com/maps');
    expect(result.hasMap).toContain(String(GEO.latitude));
    expect(result.hasMap).toContain(String(GEO.longitude));
  });

  it('amenityFeature 包含全部設施條目（與 AMENITIES 數量一致）', () => {
    const result = lodgingBusinessSchema(validInput);
    const amenities = result.amenityFeature as Array<Record<string, unknown>>;
    expect(amenities).toHaveLength(AMENITIES.length);
    for (const a of amenities) {
      expect(a['@type']).toBe('LocationFeatureSpecification');
      expect(typeof a.name).toBe('string');
      expect((a.name as string).length).toBeGreaterThan(0);
      expect(a.value).toBe(true);
    }
  });

  it('numberOfRooms 等於 NUMBER_OF_ROOMS 常數（與 src/content/rooms 數量一致）', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(result.numberOfRooms).toBe(NUMBER_OF_ROOMS);
    expect(result.numberOfRooms).toBe(5);
  });

  it('petsAllowed / smokingAllowed 為布林值且與 POLICY 一致', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(result.petsAllowed).toBe(POLICY.petsAllowed);
    expect(result.smokingAllowed).toBe(POLICY.smokingAllowed);
    expect(result.petsAllowed).toBe(false);
    expect(result.smokingAllowed).toBe(false);
  });

  it('paymentAccepted / currenciesAccepted / priceRange 設定正確', () => {
    const zh = lodgingBusinessSchema(validInput);
    const en = lodgingBusinessSchema({ ...validInput, locale: 'en' });
    expect(zh.paymentAccepted).toBe(PAYMENT.acceptedZh);
    expect(en.paymentAccepted).toBe(PAYMENT.acceptedEn);
    expect(zh.currenciesAccepted).toBe(PAYMENT.currency);
    expect(zh.priceRange).toBe(SITE.priceRange);
  });

  it('availableLanguage 為陣列含全部 LANGUAGES 條目', () => {
    const result = lodgingBusinessSchema(validInput);
    const langs = result.availableLanguage as Array<Record<string, unknown>>;
    expect(langs).toHaveLength(LANGUAGES.length);
    for (const lang of langs) {
      expect(lang['@type']).toBe('Language');
      expect(typeof lang.name).toBe('string');
      expect(typeof lang.alternateName).toBe('string');
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

  it('輸出物件為 JSON 可序列化（無 undefined / function / circular）', () => {
    const result = lodgingBusinessSchema(validInput);
    expect(() => JSON.stringify(result)).not.toThrow();
    const reparsed = JSON.parse(JSON.stringify(result));
    expect(reparsed['@type']).toBe('LodgingBusiness');
  });

  it('zh-TW / en 兩版欄位 key 集合完全對等（雙語結構對等驗證）', () => {
    // 雙語對等性是 SEO 的核心鐵律：欄位數量、key 名稱必對等，
    // 不能某一語版多/少欄位（否則 Google 會以為兩版描述不同實體）
    const zh = Object.keys(lodgingBusinessSchema(validInput)).sort();
    const en = Object.keys(
      lodgingBusinessSchema({ ...validInput, locale: 'en' }),
    ).sort();
    expect(zh).toEqual(en);
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
    expect(publisher.logo).toContain(SITE.logo);
  });

  it('en 使用英文名稱與 en inLanguage', () => {
    const result = websiteSchema('en');
    expect(result.name).toBe(SITE.nameEn);
    expect(result.inLanguage).toBe('en');
    const publisher = result.publisher as Record<string, string>;
    expect(publisher.name).toBe(SITE.nameEn);
  });

  it('不含 SearchAction（站內無搜尋功能 — MiniMax 健檢 #6 修復）', () => {
    const result = websiteSchema('zh-TW');
    // 站內未實作 /search 端點，schema 不應宣告 SearchAction
    // Google 視為低品質假宣告，反而扣分
    expect(result.potentialAction).toBeUndefined();
  });

  it('zh-TW / en 兩版 WebSite 欄位 key 集合完全對等', () => {
    const zh = Object.keys(websiteSchema('zh-TW')).sort();
    const en = Object.keys(websiteSchema('en')).sort();
    expect(zh).toEqual(en);
  });
});

describe('faqPageSchema', () => {
  const sampleItems = [
    { question: 'Check-in 時間？', answer: '15:00 至 21:00。' },
    { question: '有早餐嗎？', answer: '不提供早餐。' },
  ];

  it('產出標準 FAQPage 結構', () => {
    const result = faqPageSchema(sampleItems, 'zh-TW');
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('FAQPage');
    expect(result.inLanguage).toBe('zh-Hant-TW');
    const main = result.mainEntity as Array<Record<string, unknown>>;
    expect(main).toHaveLength(2);
    expect(main[0]['@type']).toBe('Question');
    expect(main[0].name).toBe('Check-in 時間？');
    const accepted = main[0].acceptedAnswer as Record<string, unknown>;
    expect(accepted['@type']).toBe('Answer');
    expect(accepted.text).toBe('15:00 至 21:00。');
  });

  it('en locale 的 inLanguage 為 en', () => {
    const result = faqPageSchema(sampleItems, 'en');
    expect(result.inLanguage).toBe('en');
  });

  it('空陣列 throw', () => {
    expect(() => faqPageSchema([], 'zh-TW')).toThrow(
      /faqPageSchema items 不得為空陣列/,
    );
  });

  it('題目為空字串時 throw', () => {
    expect(() =>
      faqPageSchema([{ question: '', answer: 'a' }], 'zh-TW'),
    ).toThrow(/question\/answer 不得為空白/);
  });

  it('答案為全空白時 throw', () => {
    expect(() =>
      faqPageSchema([{ question: 'q', answer: '   ' }], 'zh-TW'),
    ).toThrow(/question\/answer 不得為空白/);
  });

  it('輸出物件為 JSON 可序列化', () => {
    const result = faqPageSchema(sampleItems, 'zh-TW');
    expect(() => JSON.stringify(result)).not.toThrow();
    const reparsed = JSON.parse(JSON.stringify(result));
    expect(reparsed['@type']).toBe('FAQPage');
    expect(reparsed.mainEntity).toHaveLength(2);
  });

  it('支援多題（10 題模擬）並保留順序', () => {
    const ten = Array.from({ length: 10 }, (_, i) => ({
      question: `Q${i + 1}`,
      answer: `A${i + 1}`,
    }));
    const result = faqPageSchema(ten, 'zh-TW');
    const main = result.mainEntity as Array<Record<string, unknown>>;
    expect(main).toHaveLength(10);
    expect(main[0].name).toBe('Q1');
    expect(main[9].name).toBe('Q10');
  });
});
