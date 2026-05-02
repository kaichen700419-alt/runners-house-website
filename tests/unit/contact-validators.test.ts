/**
 * contact-validators 單元測試
 *
 * 至少覆蓋：
 *  - Email 各種格式（合法、空、缺 @、缺 TLD、含空白、+ 與 . 的 local part）
 *  - 台灣手機 09xx-xxx-xxx、含 - 與空白、市話、+886 國際格式
 *  - 退房 < 入住、入住早於今日、合法區間
 *  - 人數範圍 1-10、超出、零、負、小數
 *  - 整張表單缺欄位、全合法、收集多個錯誤
 *
 * 使用 vi.useFakeTimers 鎖定「今日」為 2026-05-02，確保日期測試穩定。
 */
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  validateContactForm,
  validateDateRange,
  validateEmail,
  validateGuestCount,
  validatePhone,
  type ContactFormData,
} from '@/lib/contact-validators';

// 統一鎖定時鐘為 2026-05-02 12:00（任務當下日期），確保 today-based 測試在任何時區跑都穩定。
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 2, 12, 0, 0));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('validateEmail', () => {
  it('合法 Email 通過', () => {
    expect(validateEmail('user@example.com').ok).toBe(true);
    expect(validateEmail('first.last+tag@sub.example.co.uk').ok).toBe(true);
    expect(validateEmail('  spaces.trim@example.com  ').ok).toBe(true);
  });

  it('空字串回 errorRequired', () => {
    expect(validateEmail('')).toEqual({ ok: false, error: 'errorRequired' });
    expect(validateEmail('   ')).toEqual({ ok: false, error: 'errorRequired' });
  });

  it('缺 @ 或缺 TLD 回 errorEmail', () => {
    expect(validateEmail('user.example.com').error).toBe('errorEmail');
    expect(validateEmail('user@example').error).toBe('errorEmail');
    expect(validateEmail('@example.com').error).toBe('errorEmail');
  });

  it('多個 @ 或內含空白回 errorEmail', () => {
    expect(validateEmail('a@b@example.com').error).toBe('errorEmail');
    expect(validateEmail('user @example.com').error).toBe('errorEmail');
  });
});

describe('validatePhone', () => {
  it('台灣行動電話格式合法（含 - 與空白）', () => {
    expect(validatePhone('0912345678').ok).toBe(true);
    expect(validatePhone('0912-345-678').ok).toBe(true);
    expect(validatePhone('0912 345 678').ok).toBe(true);
    expect(validatePhone('0933-430-418').ok).toBe(true);
  });

  it('+886 國際格式合法', () => {
    expect(validatePhone('+886933430418').ok).toBe(true);
    expect(validatePhone('+886 933 430 418').ok).toBe(true);
  });

  it('市話格式合法', () => {
    expect(validatePhone('089-100100').ok).toBe(true);
    expect(validatePhone('02-12345678').ok).toBe(true);
  });

  it('空字串回 errorRequired', () => {
    expect(validatePhone('')).toEqual({ ok: false, error: 'errorRequired' });
  });

  it('長度錯或非台灣格式回 errorPhone', () => {
    expect(validatePhone('123').error).toBe('errorPhone');
    expect(validatePhone('09123').error).toBe('errorPhone');
    expect(validatePhone('abcdefghij').error).toBe('errorPhone');
    expect(validatePhone('1234567890').error).toBe('errorPhone');
  });
});

describe('validateDateRange', () => {
  it('合法區間（入住今日、退房明日）通過', () => {
    expect(validateDateRange('2026-05-02', '2026-05-03').ok).toBe(true);
  });

  it('合法區間（多日後）通過', () => {
    expect(validateDateRange('2026-06-10', '2026-06-15').ok).toBe(true);
  });

  it('入住早於今日回 errorCheckInPast', () => {
    expect(validateDateRange('2026-05-01', '2026-05-03').error).toBe('errorCheckInPast');
    expect(validateDateRange('2025-12-31', '2026-01-02').error).toBe('errorCheckInPast');
  });

  it('退房等於或早於入住回 errorCheckOutBeforeIn', () => {
    expect(validateDateRange('2026-05-10', '2026-05-10').error).toBe('errorCheckOutBeforeIn');
    expect(validateDateRange('2026-05-10', '2026-05-09').error).toBe('errorCheckOutBeforeIn');
  });

  it('缺欄位回 errorRequired', () => {
    expect(validateDateRange('', '2026-05-10').error).toBe('errorRequired');
    expect(validateDateRange('2026-05-10', '').error).toBe('errorRequired');
    expect(validateDateRange('', '').error).toBe('errorRequired');
  });

  it('非法日期格式（非 yyyy-mm-dd 或無效月份日）回 errorRequired', () => {
    expect(validateDateRange('2026/05/10', '2026/05/12').error).toBe('errorRequired');
    expect(validateDateRange('2026-13-01', '2026-13-05').error).toBe('errorRequired');
    expect(validateDateRange('2026-02-30', '2026-03-01').error).toBe('errorRequired');
  });
});

describe('validateGuestCount', () => {
  it('1-10 範圍內通過', () => {
    for (let i = 1; i <= 10; i++) {
      expect(validateGuestCount(i).ok).toBe(true);
    }
  });

  it('0、負數、超過 10 回 errorGuestsRange', () => {
    expect(validateGuestCount(0).error).toBe('errorGuestsRange');
    expect(validateGuestCount(-1).error).toBe('errorGuestsRange');
    expect(validateGuestCount(11).error).toBe('errorGuestsRange');
    expect(validateGuestCount(99).error).toBe('errorGuestsRange');
  });

  it('小數、NaN、Infinity 回 errorGuestsRange', () => {
    expect(validateGuestCount(2.5).error).toBe('errorGuestsRange');
    expect(validateGuestCount(NaN).error).toBe('errorGuestsRange');
    expect(validateGuestCount(Infinity).error).toBe('errorGuestsRange');
  });
});

describe('validateContactForm 整體', () => {
  const validData = (): ContactFormData => ({
    name: '王小明',
    email: 'user@example.com',
    phone: '0912-345-678',
    checkIn: '2026-05-10',
    checkOut: '2026-05-12',
    guests: 2,
    roomPreference: 'standard-double',
    subject: 'booking',
    message: '想預訂雙人房，希望面海。',
  });

  it('完整合法資料 ok=true 且 errors 為空', () => {
    const result = validateContactForm(validData());
    expect(result.ok).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('全部欄位缺失時收集所有錯誤', () => {
    const result = validateContactForm({
      name: '',
      email: '',
      phone: '',
      checkIn: '',
      checkOut: '',
      guests: 0,
      roomPreference: '',
      subject: '',
      message: '',
    });
    expect(result.ok).toBe(false);
    // 至少應蒐集到 name / email / phone / dateRange / guests / subject / roomPreference / message 8 個錯誤
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(8);
    expect(result.errors.name).toBe('errorRequired');
    expect(result.errors.email).toBe('errorRequired');
    expect(result.errors.message).toBe('errorRequired');
    expect(result.errors.guests).toBe('errorGuestsRange');
  });

  it('短訊息（< 10 字）收集 errorMessageMin', () => {
    const data = { ...validData(), message: '太短' };
    const result = validateContactForm(data);
    expect(result.ok).toBe(false);
    expect(result.errors.message).toBe('errorMessageMin');
  });

  it('退房早於入住收集 errorCheckOutBeforeIn', () => {
    const data = { ...validData(), checkIn: '2026-05-12', checkOut: '2026-05-10' };
    const result = validateContactForm(data);
    expect(result.errors.dateRange).toBe('errorCheckOutBeforeIn');
  });

  it('多欄位錯誤同時收集（email + phone + guests + message）', () => {
    const data: ContactFormData = {
      name: '王小明',
      email: 'not-an-email',
      phone: 'not-a-phone',
      checkIn: '2026-05-10',
      checkOut: '2026-05-12',
      guests: 99,
      roomPreference: 'sea-suite',
      subject: 'booking',
      message: '太短',
    };
    const result = validateContactForm(data);
    expect(result.ok).toBe(false);
    expect(result.errors.email).toBe('errorEmail');
    expect(result.errors.phone).toBe('errorPhone');
    expect(result.errors.guests).toBe('errorGuestsRange');
    expect(result.errors.message).toBe('errorMessageMin');
    // name / subject / roomPreference / dateRange 都合法 → 不應出現在 errors
    expect(result.errors.name).toBeUndefined();
    expect(result.errors.dateRange).toBeUndefined();
  });
});
