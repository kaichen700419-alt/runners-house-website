/**
 * i18n 系統單元測試
 *
 * 測試重點：
 *  - useTranslations(t) 在缺 key、含 params、巢狀 key 等情境的行為
 *  - detectLocale 對各種 pathname 的判斷
 *  - getLocalizedPath / getAlternateLocaleUrl 的路徑前綴處理
 *  - 字典完整性：zh-TW 與 en 的 key 樹必須完全一致
 *  - isLocale 型別守門
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  detectLocale,
  getAlternateLocaleUrl,
  getLocalizedPath,
  useTranslations,
} from '@/i18n/utils';
import { isLocale, LOCALES } from '@/i18n/types';
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
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = useTranslations('zh-TW');
    expect(t('nav.home')).toBe('首頁');
    // 命中 primary 字典時不應觸發任何 console.warn
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('能取出 en 字典中的字串值', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = useTranslations('en');
    expect(t('nav.home')).toBe('Home');
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('支援巢狀 namespace 多層 key（精確值斷言，非 typeof string）', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    // home.heroTitle 為字典實際存在的扁平 key；補上精確字串斷言避免假陽性 pass
    const t = useTranslations('zh-TW');
    expect(t('home.heroTitle')).toBe('跑步就是回家的路');
    expect(t('seo.homeTitle')).toBe(
      '跑者之家 Runners House｜台東長濱跑者主題民宿',
    );
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('支援 {param} 樣式單一插值', () => {
    const t = useTranslations('zh-TW');
    expect(t('common.copyright', { year: '2026' })).toContain('2026');
  });

  it('多個 params 同時替換（使用 common.copyrightLong 三個 placeholder）', () => {
    const t = useTranslations('zh-TW');
    const result = t('common.copyrightLong', {
      year: '2099',
      site: '跑者之家',
      tagline: '海邊跑者主場',
    });
    expect(result).toContain('2099');
    expect(result).toContain('跑者之家');
    expect(result).toContain('海邊跑者主場');
    expect(result).not.toContain('{year}');
    expect(result).not.toContain('{site}');
    expect(result).not.toContain('{tagline}');
  });

  it('多個 params 同時替換（en 字典）', () => {
    const t = useTranslations('en');
    const result = t('common.copyrightLong', {
      year: '2099',
      site: 'Runners House',
      tagline: 'Runner home base',
    });
    expect(result).toContain('2099');
    expect(result).toContain('Runners House');
    expect(result).toContain('Runner home base');
  });

  it('缺少對應 param 時保留原本 placeholder', () => {
    const t = useTranslations('zh-TW');
    expect(t('common.copyright')).toContain('{year}');
  });

  describe('fallback 行為', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('en 缺 key 時 fallback 至 zh-TW（透過 mock primary 字典模擬殘缺）', async () => {
      // 使用 vi.doMock 動態替換 en 字典，模擬「en 缺 key 但 zh-TW 有」的真實情境
      vi.doMock('@/i18n/en', () => ({
        // common.copyright 只保留中文版時 en 字典缺此 key
        default: { common: {} },
      }));
      // 重要：必須清除 module cache 使 utils 重新載入 mock 後的 en
      vi.resetModules();
      const utils = await import('@/i18n/utils');
      const t = utils.useTranslations('en');
      // en 字典缺 nav.home → 走 fallback → 取 zh-TW 的「首頁」
      expect(t('nav.home')).toBe('首頁');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('locale=en 缺少 key "nav.home"'),
      );
      // 還原避免污染後續測試
      vi.doUnmock('@/i18n/en');
      vi.resetModules();
    });

    it('完全找不到 key 時回傳 key 並 console.warn', () => {
      const t = useTranslations('zh-TW');
      expect(t('totally.invalid.key')).toBe('totally.invalid.key');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('找不到 key "totally.invalid.key"'),
      );
    });

    it('lookup 中間節點為物件（非葉節點）時回傳 key', () => {
      const t = useTranslations('zh-TW');
      // nav 本身為物件而非字串葉節點 → 視為缺失
      expect(t('nav')).toBe('nav');
      expect(warnSpy).toHaveBeenCalled();
    });

    it('lookup 路徑超過實際深度時回傳 key', () => {
      const t = useTranslations('zh-TW');
      // nav.home 是字串葉節點，再向下挖 nav.home.extra 應視為缺失
      expect(t('nav.home.extra')).toBe('nav.home.extra');
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  it('空字串 key 安全處理回傳空字串並警告', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = useTranslations('zh-TW');
    expect(t('')).toBe('');
    expect(warn).toHaveBeenCalledWith('[i18n] 收到空字串 key，回傳空字串');
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

  it('帶 query string 的 /en 路徑仍視為 en', () => {
    // /en/about?foo=bar 應辨識為 en；雖然 detectLocale 只看 pathname，
    // 呼叫端傳入 pathname 不應含 query；但測試保險地驗證 startsWith 邏輯。
    expect(detectLocale('/en/about?foo=bar')).toBe('en');
  });

  it('帶 hash 的 /en 路徑仍視為 en', () => {
    expect(detectLocale('/en/about#anchor')).toBe('en');
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

  it('空字串 path → 視為根路徑', () => {
    expect(getLocalizedPath('', 'zh-TW')).toBe('/');
    expect(getLocalizedPath('', 'en')).toBe('/en');
  });

  it('保留 query string 與 hash（透明轉接）', () => {
    // getLocalizedPath 對 path 字串不解析 query / hash，原樣保留 + 加前綴
    expect(getLocalizedPath('/about?foo=bar', 'en')).toBe('/en/about?foo=bar');
    expect(getLocalizedPath('/about#anchor', 'en')).toBe('/en/about#anchor');
    expect(getLocalizedPath('/en/about?foo=bar', 'zh-TW')).toBe('/about?foo=bar');
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

describe('isLocale 型別守門', () => {
  it('合法 locale 字串回傳 true', () => {
    expect(isLocale('zh-TW')).toBe(true);
    expect(isLocale('en')).toBe(true);
  });

  it('非合法字串回傳 false', () => {
    expect(isLocale('zh-CN')).toBe(false);
    expect(isLocale('jp')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale('EN')).toBe(false); // 大小寫敏感
  });

  it('LOCALES 常數內每一項都通過 isLocale', () => {
    for (const l of LOCALES) {
      expect(isLocale(l)).toBe(true);
    }
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

  // 限縮 spy 範圍至需要的 describe，避免污染其他測試斷言
  describe('葉節點型別檢查（含 spy）', () => {
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
});
