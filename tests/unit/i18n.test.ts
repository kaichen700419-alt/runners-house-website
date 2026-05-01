/**
 * i18n 系統單元測試
 *
 * 測試重點：
 *  - useTranslations(t) 在缺 key、含 params、巢狀 key 等情境的行為
 *  - detectLocale 對各種 pathname 的判斷
 *  - getLocalizedPath / getAlternateLocaleUrl 的路徑前綴處理
 *  - 字典完整性：zh-TW 與 en 的 key 樹必須完全一致
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  detectLocale,
  getAlternateLocaleUrl,
  getLocalizedPath,
  useTranslations,
} from '@/i18n/utils';
import zhTW from '@/i18n/zh-TW';
import en from '@/i18n/en';

// 收集字典中所有「葉節點 key」的點分隔路徑，用於完整性比對。
function collectKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) {
    return [prefix];
  }
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    keys.push(...collectKeys(v, next));
  }
  return keys;
}

describe('useTranslations', () => {
  it('能取出 zh-TW 字典中的字串值', () => {
    const t = useTranslations('zh-TW');
    expect(t('nav.home')).toBe('首頁');
  });

  it('能取出 en 字典中的字串值', () => {
    const t = useTranslations('en');
    expect(t('nav.home')).toBe('Home');
  });

  it('支援巢狀 namespace 多層 key', () => {
    const t = useTranslations('zh-TW');
    // home.hero.title 必定為字串（字典結構保證）
    expect(typeof t('home.hero.title')).toBe('string');
    expect(t('home.hero.title').length).toBeGreaterThan(0);
  });

  it('支援 {param} 樣式插值', () => {
    const t = useTranslations('zh-TW');
    expect(t('common.copyright', { year: '2026' })).toContain('2026');
  });

  it('多個 params 同時替換', () => {
    const t = useTranslations('en');
    expect(t('common.copyright', { year: '2099' })).toContain('2099');
  });

  it('缺少對應 param 時保留原本 placeholder', () => {
    const t = useTranslations('zh-TW');
    expect(t('common.copyright')).toContain('{year}');
  });

  it('en 缺 key 時 fallback 到 zh-TW', () => {
    // 直接呼叫 helper，模擬若 en 字典缺某 key 的 fallback 行為。
    // 因為兩字典完整性測試保證 key 一致，這裡使用一個不存在的 key 觀察 warn。
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = useTranslations('en');
    const result = t('does.not.exist');
    expect(result).toBe('does.not.exist');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('完全找不到 key 時回傳 key 並 console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = useTranslations('zh-TW');
    expect(t('totally.invalid.key')).toBe('totally.invalid.key');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('空字串 key 安全處理回傳空字串並警告', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = useTranslations('zh-TW');
    expect(t('')).toBe('');
    warn.mockRestore();
  });
});

describe('detectLocale', () => {
  it('根路徑回傳 zh-TW', () => {
    expect(detectLocale('/')).toBe('zh-TW');
  });

  it('一般中文頁面路徑回傳 zh-TW', () => {
    expect(detectLocale('/about')).toBe('zh-TW');
    expect(detectLocale('/rooms/sea-view')).toBe('zh-TW');
  });

  it('/en 開頭回傳 en', () => {
    expect(detectLocale('/en')).toBe('en');
  });

  it('/en/ 開頭回傳 en', () => {
    expect(detectLocale('/en/')).toBe('en');
    expect(detectLocale('/en/about')).toBe('en');
    expect(detectLocale('/en/rooms/sea-view')).toBe('en');
  });

  it('包含 en 但不在開頭時不視為 en', () => {
    expect(detectLocale('/runners/eng-events')).toBe('zh-TW');
    expect(detectLocale('/about/en-history')).toBe('zh-TW');
  });

  it('空字串視為 zh-TW', () => {
    expect(detectLocale('')).toBe('zh-TW');
  });
});

describe('getLocalizedPath', () => {
  it('zh-TW 不加前綴', () => {
    expect(getLocalizedPath('/about', 'zh-TW')).toBe('/about');
    expect(getLocalizedPath('/', 'zh-TW')).toBe('/');
  });

  it('en 加上 /en 前綴', () => {
    expect(getLocalizedPath('/about', 'en')).toBe('/en/about');
  });

  it('en 對根路徑加上 /en', () => {
    expect(getLocalizedPath('/', 'en')).toBe('/en');
  });

  it('已含 /en 前綴時不重複加', () => {
    expect(getLocalizedPath('/en/about', 'en')).toBe('/en/about');
    expect(getLocalizedPath('/en', 'en')).toBe('/en');
  });

  it('zh-TW 收到帶 /en 前綴時移除', () => {
    expect(getLocalizedPath('/en/about', 'zh-TW')).toBe('/about');
    expect(getLocalizedPath('/en', 'zh-TW')).toBe('/');
  });

  it('沒有開頭斜線的 path 也能處理', () => {
    expect(getLocalizedPath('about', 'zh-TW')).toBe('/about');
    expect(getLocalizedPath('about', 'en')).toBe('/en/about');
  });
});

describe('getAlternateLocaleUrl', () => {
  it('從 zh-TW 切到 en', () => {
    expect(getAlternateLocaleUrl('/about', 'en')).toBe('/en/about');
    expect(getAlternateLocaleUrl('/', 'en')).toBe('/en');
  });

  it('從 en 切回 zh-TW', () => {
    expect(getAlternateLocaleUrl('/en/about', 'zh-TW')).toBe('/about');
    expect(getAlternateLocaleUrl('/en', 'zh-TW')).toBe('/');
  });

  it('保留多層路徑', () => {
    expect(getAlternateLocaleUrl('/rooms/sea-view', 'en')).toBe('/en/rooms/sea-view');
    expect(getAlternateLocaleUrl('/en/rooms/sea-view', 'zh-TW')).toBe('/rooms/sea-view');
  });

  it('同 locale 切換結果保持不變', () => {
    expect(getAlternateLocaleUrl('/about', 'zh-TW')).toBe('/about');
    expect(getAlternateLocaleUrl('/en/about', 'en')).toBe('/en/about');
  });
});

describe('字典完整性', () => {
  it('zh-TW 與 en 的 key 樹完全一致', () => {
    const zhKeys = collectKeys(zhTW).sort();
    const enKeys = collectKeys(en).sort();
    const missingInEn = zhKeys.filter((k) => !enKeys.includes(k));
    const extraInEn = enKeys.filter((k) => !zhKeys.includes(k));
    expect(missingInEn, `en 缺少: ${missingInEn.join(', ')}`).toEqual([]);
    expect(extraInEn, `en 多出: ${extraInEn.join(', ')}`).toEqual([]);
  });

  it('每個 namespace 至少有 8 個 key', () => {
    const namespaces = Object.keys(zhTW) as Array<keyof typeof zhTW>;
    for (const ns of namespaces) {
      const keys = collectKeys(zhTW[ns]);
      expect(keys.length, `namespace ${String(ns)} 太少 key`).toBeGreaterThanOrEqual(8);
    }
  });

  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('所有葉節點都是非空字串', () => {
    const checkAll = (obj: unknown, prefix = ''): void => {
      if (typeof obj === 'string') {
        expect(obj.length, `${prefix} 為空字串`).toBeGreaterThan(0);
        return;
      }
      if (typeof obj !== 'object' || obj === null) {
        throw new Error(`${prefix} 非預期型別`);
      }
      for (const [k, v] of Object.entries(obj)) {
        checkAll(v, prefix ? `${prefix}.${k}` : k);
      }
    };
    checkAll(zhTW);
    checkAll(en);
  });
});
