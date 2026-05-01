/**
 * lib/navigation.ts 單元測試
 *
 * 覆蓋：
 *  - NAV_ITEMS / MOBILE_NAV_ITEMS 的結構與順序
 *  - resolveNavHrefs 中英 locale 的 href 結果
 *  - 空陣列輸入安全
 *  - 每個 NavItem.key 都對應字典中真實存在的字串
 */
import { describe, expect, it } from 'vitest';
import {
  MOBILE_NAV_ITEMS,
  NAV_ITEMS,
  resolveNavHrefs,
  type NavItem,
} from '@/lib/navigation';
import { useTranslations } from '@/i18n/utils';

describe('NAV_ITEMS / MOBILE_NAV_ITEMS', () => {
  it('NAV_ITEMS 不含首頁（首頁透過品牌 mark 連結）', () => {
    const keys = NAV_ITEMS.map((i) => i.key);
    expect(keys).not.toContain('nav.home');
  });

  it('MOBILE_NAV_ITEMS 第一項為首頁', () => {
    expect(MOBILE_NAV_ITEMS[0]?.key).toBe('nav.home');
    expect(MOBILE_NAV_ITEMS[0]?.path).toBe('/');
  });

  it('MOBILE_NAV_ITEMS 為 NAV_ITEMS + 首頁，順序維持一致', () => {
    expect(MOBILE_NAV_ITEMS.length).toBe(NAV_ITEMS.length + 1);
    expect(MOBILE_NAV_ITEMS.slice(1)).toEqual(NAV_ITEMS);
  });

  it('每個 NAV_ITEMS path 都以 / 開頭', () => {
    for (const item of NAV_ITEMS) {
      expect(item.path.startsWith('/')).toBe(true);
    }
  });
});

describe('resolveNavHrefs', () => {
  it('zh-TW 直接保留原 path', () => {
    const resolved = resolveNavHrefs(NAV_ITEMS, 'zh-TW');
    expect(resolved).toHaveLength(NAV_ITEMS.length);
    for (let i = 0; i < NAV_ITEMS.length; i++) {
      expect(resolved[i]?.href).toBe(NAV_ITEMS[i]?.path);
      expect(resolved[i]?.key).toBe(NAV_ITEMS[i]?.key);
    }
  });

  it('en 為每條 path 加上 /en 前綴', () => {
    const resolved = resolveNavHrefs(NAV_ITEMS, 'en');
    for (let i = 0; i < NAV_ITEMS.length; i++) {
      expect(resolved[i]?.href).toBe(`/en${NAV_ITEMS[i]?.path}`);
    }
  });

  it('en + 首頁 path "/" 產出 "/en"（非 "/en/"）', () => {
    const home: NavItem = { key: 'nav.home', path: '/' };
    const [resolved] = resolveNavHrefs([home], 'en');
    expect(resolved?.href).toBe('/en');
  });

  it('zh-TW + 首頁 path "/" 維持 "/"', () => {
    const home: NavItem = { key: 'nav.home', path: '/' };
    const [resolved] = resolveNavHrefs([home], 'zh-TW');
    expect(resolved?.href).toBe('/');
  });

  it('空陣列輸入回傳空陣列', () => {
    expect(resolveNavHrefs([], 'zh-TW')).toEqual([]);
    expect(resolveNavHrefs([], 'en')).toEqual([]);
  });
});

describe('NavItem.key 與字典對應', () => {
  it('NAV_ITEMS 與 MOBILE_NAV_ITEMS 中每個 key 都能在 zh-TW 字典找到非空字串', () => {
    const t = useTranslations('zh-TW');
    for (const item of MOBILE_NAV_ITEMS) {
      const value = t(item.key);
      expect(value, `zh-TW 缺少 ${item.key}`).not.toBe(item.key); // 找不到 key 會回傳 key 自身
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it('NAV_ITEMS 與 MOBILE_NAV_ITEMS 中每個 key 都能在 en 字典找到非空字串', () => {
    const t = useTranslations('en');
    for (const item of MOBILE_NAV_ITEMS) {
      const value = t(item.key);
      expect(value, `en 缺少 ${item.key}`).not.toBe(item.key);
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
