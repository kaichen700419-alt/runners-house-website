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
