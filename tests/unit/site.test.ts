/**
 * lib/site.ts 單元測試
 *
 * 驗證單一真相常數的格式正確性，避免：
 *   - 電話 / Email / URL 字面手動編輯時出錯導致 SEO/聯絡功能崩壞
 *   - 經緯度被誤改成不合理範圍
 *   - Check-in/out 時間格式偏離 schema.org HH:mm 期望
 */
import { describe, expect, it } from 'vitest';
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
  SITE_URL,
} from '@/lib/site';

describe('SITE 與 SITE_URL', () => {
  it('SITE_URL 為含 https 的絕對 URL，無尾斜線', () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^\s]+$/);
    expect(SITE_URL.endsWith('/')).toBe(false);
  });

  it('SITE.url 與 SITE_URL 一致', () => {
    expect(SITE.url).toBe(SITE_URL);
  });

  it('品牌名稱為非空字串', () => {
    expect(SITE.nameZh.length).toBeGreaterThan(0);
    expect(SITE.nameEn.length).toBeGreaterThan(0);
  });

  it('brandMark 為短英文縮寫（2-4 字）', () => {
    expect(SITE.brandMark).toMatch(/^[A-Z]{2,4}$/);
  });

  it('defaultOgImage 為以 / 開頭的相對路徑', () => {
    expect(SITE.defaultOgImage.startsWith('/')).toBe(true);
  });

  it('OG locale 字串為符合 OG 規範的 xx_XX 格式', () => {
    expect(SITE.ogLocaleZh).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    expect(SITE.ogLocaleEn).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
  });
});

describe('CONTACT', () => {
  it('phone 為 E.164 格式（+886-...）', () => {
    expect(CONTACT.phone).toMatch(/^\+\d{1,3}-[\d-]+$/);
  });

  it('phoneDisplay 僅含數字與短橫', () => {
    expect(CONTACT.phoneDisplay).toMatch(/^[\d-]+$/);
  });

  it('email 為合法格式', () => {
    expect(CONTACT.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('lineId 以 @ 開頭', () => {
    expect(CONTACT.lineId.startsWith('@')).toBe(true);
  });

  it('社群 URL 皆為 https 絕對網址', () => {
    expect(CONTACT.lineUrl).toMatch(/^https:\/\//);
    expect(CONTACT.facebookUrl).toMatch(/^https:\/\//);
    expect(CONTACT.instagramUrl).toMatch(/^https:\/\//);
  });
});

describe('ADDRESS', () => {
  it('postalCode 為三碼數字（台灣 3+2 制最少三碼）', () => {
    expect(ADDRESS.postalCode).toMatch(/^\d{3,5}$/);
  });

  it('中文與英文地址欄位皆非空', () => {
    expect(ADDRESS.streetZh.length).toBeGreaterThan(0);
    expect(ADDRESS.cityZh.length).toBeGreaterThan(0);
    expect(ADDRESS.regionZh.length).toBeGreaterThan(0);
    expect(ADDRESS.countryZh.length).toBeGreaterThan(0);
    expect(ADDRESS.fullZh.length).toBeGreaterThan(0);
    expect(ADDRESS.streetEn.length).toBeGreaterThan(0);
    expect(ADDRESS.cityEn.length).toBeGreaterThan(0);
    expect(ADDRESS.regionEn.length).toBeGreaterThan(0);
    expect(ADDRESS.countryEn.length).toBeGreaterThan(0);
    expect(ADDRESS.fullEn.length).toBeGreaterThan(0);
  });
});

describe('GEO', () => {
  it('latitude 在台灣可能範圍 (21~26)', () => {
    expect(GEO.latitude).toBeGreaterThan(21);
    expect(GEO.latitude).toBeLessThan(26);
  });

  it('longitude 在台灣可能範圍 (119~123)', () => {
    expect(GEO.longitude).toBeGreaterThan(119);
    expect(GEO.longitude).toBeLessThan(123);
  });

  it('latitude/longitude 為有限數字', () => {
    expect(Number.isFinite(GEO.latitude)).toBe(true);
    expect(Number.isFinite(GEO.longitude)).toBe(true);
  });
});

describe('HOURS', () => {
  it('checkin / checkout 為 HH:mm 格式', () => {
    const re = /^([01]\d|2[0-3]):[0-5]\d$/;
    expect(HOURS.checkin).toMatch(re);
    expect(HOURS.checkout).toMatch(re);
  });

  it('frontDeskOpen / frontDeskClose 為 HH:mm 格式', () => {
    const re = /^([01]\d|2[0-3]):[0-5]\d$/;
    expect(HOURS.frontDeskOpen).toMatch(re);
    expect(HOURS.frontDeskClose).toMatch(re);
  });

  it('開放時間早於關閉時間', () => {
    expect(HOURS.frontDeskOpen < HOURS.frontDeskClose).toBe(true);
  });

  it('checkout 時間早於 checkin 時間（旅館慣例：先退房再入住）', () => {
    // 旅館業界慣例：當日清晨 checkout（如 11:00）→ 下午 checkin（如 15:00），
    // 中間時段供清潔房務。若反轉會導致同一房同時有兩組客人字串相比較合法（HH:mm 字典序與時間順序一致）。
    expect(HOURS.checkout < HOURS.checkin).toBe(true);
  });
});

describe('AMENITIES', () => {
  it('每項皆有非空 zh / en 欄位', () => {
    expect(AMENITIES.length).toBeGreaterThanOrEqual(6);
    for (const a of AMENITIES) {
      expect(a.zh.length).toBeGreaterThan(0);
      expect(a.en.length).toBeGreaterThan(0);
    }
  });
});

describe('ADDRESS.countryCode', () => {
  it('countryCode 為 ISO 3166-1 alpha-2 大寫兩字（schema.org 要求）', () => {
    expect(ADDRESS.countryCode).toMatch(/^[A-Z]{2}$/);
    expect(ADDRESS.countryCode).toBe('TW');
  });
});

describe('NUMBER_OF_ROOMS', () => {
  it('為正整數，且與 src/content/rooms 房型 collection 數量一致（5 間）', () => {
    expect(Number.isInteger(NUMBER_OF_ROOMS)).toBe(true);
    expect(NUMBER_OF_ROOMS).toBeGreaterThan(0);
    expect(NUMBER_OF_ROOMS).toBe(5);
  });
});

describe('POLICY', () => {
  it('petsAllowed / smokingAllowed / servesBreakfast 為布林值', () => {
    expect(typeof POLICY.petsAllowed).toBe('boolean');
    expect(typeof POLICY.smokingAllowed).toBe('boolean');
    expect(typeof POLICY.servesBreakfast).toBe('boolean');
  });

  it('業主確認的政策：禁寵、禁菸、不供餐', () => {
    expect(POLICY.petsAllowed).toBe(false);
    expect(POLICY.smokingAllowed).toBe(false);
    expect(POLICY.servesBreakfast).toBe(false);
  });

  it('depositRatio 介於 0~1 之間', () => {
    expect(POLICY.depositRatio).toBeGreaterThan(0);
    expect(POLICY.depositRatio).toBeLessThanOrEqual(1);
  });
});

describe('PAYMENT', () => {
  it('acceptedZh / acceptedEn 為非空字串', () => {
    expect(PAYMENT.acceptedZh.length).toBeGreaterThan(0);
    expect(PAYMENT.acceptedEn.length).toBeGreaterThan(0);
  });

  it('currency 為 ISO 4217 三字大寫代碼', () => {
    expect(PAYMENT.currency).toMatch(/^[A-Z]{3}$/);
    expect(PAYMENT.currency).toBe('TWD');
  });
});

describe('LANGUAGES', () => {
  it('含 zh-TW 與 en 兩個語系（與 i18n LOCALES 一致）', () => {
    expect(LANGUAGES).toContain('zh-TW');
    expect(LANGUAGES).toContain('en');
    expect(LANGUAGES).toHaveLength(2);
  });
});

describe('SITE 完整欄位（SEO 用）', () => {
  it('含 alternateNameZh / alternateNameEn 用於雙語 schema.alternateName', () => {
    expect(SITE.alternateNameZh.length).toBeGreaterThan(0);
    expect(SITE.alternateNameEn.length).toBeGreaterThan(0);
  });

  it('logo 為以 / 開頭的相對路徑（在 schema 中會經 URL ctor 轉絕對網址）', () => {
    expect(SITE.logo.startsWith('/')).toBe(true);
  });

  it('priceRange 為合法字串（schema.org 接受 "$$" 等等級或數字區間）', () => {
    expect(SITE.priceRange.length).toBeGreaterThan(0);
  });
});

describe('AMENITIES 業主真實設施', () => {
  it('含「投幣式洗衣機」「投幣式烘衣機」「戶外免費停車」「Tesla Wall Connector」', () => {
    const zhSet = new Set(AMENITIES.map((a) => a.zh));
    expect(zhSet.has('投幣式洗衣機')).toBe(true);
    expect(zhSet.has('投幣式烘衣機')).toBe(true);
    expect(zhSet.has('戶外免費停車')).toBe(true);
    expect(zhSet.has('Tesla Wall Connector 自費超充')).toBe(true);
  });
});

describe('GEO 業主確認真實座標', () => {
  it('經緯度落在跑者之家所在的長濱鄉合理範圍（緯度 23.2~23.4、經度 121.4~121.5）', () => {
    expect(GEO.latitude).toBeGreaterThan(23.2);
    expect(GEO.latitude).toBeLessThan(23.4);
    expect(GEO.longitude).toBeGreaterThan(121.4);
    expect(GEO.longitude).toBeLessThan(121.5);
  });
});

describe('HOURS 完整欄位', () => {
  it('含 checkinEnd 為 HH:mm 格式且晚於 checkin', () => {
    expect(HOURS.checkinEnd).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect(HOURS.checkinEnd > HOURS.checkin).toBe(true);
  });
});
