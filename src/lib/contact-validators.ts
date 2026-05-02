/**
 * Contact form 驗證 helpers
 *
 * 用於聯絡頁的訂房／詢問表單。
 *
 * 設計原則：
 *   - 全部 helper 都是純函式：相同輸入永遠相同輸出，方便單元測試與伺服器端共用
 *   - 統一回傳 `{ ok, error? }` 形狀，呼叫端不必揣測 throw / return null 的差異
 *   - 錯誤訊息回傳 i18n key（如 `errorEmail`）而非寫死字串；
 *     呼叫端透過 `useTranslations` 把 key 轉成顯示字串，避免驗證邏輯與語系耦合
 *   - 前端 HTML5 native validation 與此檔同步約束（pattern / required / min / max），
 *     確保 client / server 兩端拒絕同一組無效輸入
 */

/** 單一欄位驗證結果 */
export interface FieldResult {
  ok: boolean;
  /** 失敗時的 i18n key（contact.errorXxx）；成功時 undefined */
  error?: string;
}

/** 整張表單驗證結果，errors 鍵為欄位名、值為 i18n key */
export interface FormResult {
  ok: boolean;
  errors: Record<string, string>;
}

/** 表單資料形狀；對應 zh-TW.ts 的 contact.form* keys */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  /** ISO yyyy-mm-dd（HTML <input type="date"> 預設輸出） */
  checkIn: string;
  /** ISO yyyy-mm-dd */
  checkOut: string;
  guests: number;
  roomPreference: string;
  subject: string;
  message: string;
}

/**
 * RFC 5322 簡化版 Email 正則：
 *   - 拒絕空白、連續點、無 @、多 @
 *   - 容忍 + 與 . 在 local part
 *
 * 不採完整 RFC 5322 是因 99% 真實 email 不需要那層複雜度，
 * 完整版會誤通過大量罕見格式並讓正則難以維護。
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

/**
 * 台灣手機與市話正則：
 *   - 行動電話：09 開頭 + 8 位數字（共 10 碼），可含 - 或空白分隔
 *   - 市話：0 + 1-2 碼區碼 + 6-8 碼，可含 - 分隔
 *   - 國際格式：+886 開頭，後接 9 位數
 *
 * 採 stripped digit-only 方式比對，先去除常見分隔符再判斷長度與開頭。
 */
function stripPhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

/**
 * 把 ISO yyyy-mm-dd 字串轉為「當地時區 00:00 的 Date 物件」。
 *
 * 不直接用 `new Date(str)` 是因為當字串為 yyyy-mm-dd 時 V8 會把它解析為 UTC 00:00，
 * 在台灣時區（UTC+8）會被當成「前一日 16:00」，導致「今日」比較邏輯錯一天。
 * 改用拆字串手動建構 Date(y, m-1, d) 強制使用本地時區。
 */
function parseDateLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) {
    return null;
  }
  const d = new Date(year, month - 1, day);
  // 防止 new Date(2026, 1, 31) 自動換算為 3 月 3 日這種隱性溢位
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

/** 取得「今日 00:00（本地時區）」的 Date，方便與入住日比較不受時分秒影響 */
function todayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 驗證 Email。
 * 空字串 → 視為缺欄位，回 `errorRequired`。
 */
export function validateEmail(email: string): FieldResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, error: 'errorRequired' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { ok: false, error: 'errorEmail' };
  }
  return { ok: true };
}

/**
 * 驗證電話。
 * 空字串 → 視為缺欄位，回 `errorRequired`。
 *
 * 規則：
 *   - 09xxxxxxxx（10 碼，0 開頭）
 *   - 0[1-8]xxxxxxx（9-10 碼市話）
 *   - +886 開頭後接 9 位數
 */
export function validatePhone(phone: string): FieldResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { ok: false, error: 'errorRequired' };
  }
  const stripped = stripPhone(trimmed);
  // 國際格式 +886
  if (/^\+886\d{9}$/.test(stripped)) {
    return { ok: true };
  }
  // 行動電話 09xxxxxxxx
  if (/^09\d{8}$/.test(stripped)) {
    return { ok: true };
  }
  // 市話：0 開頭，總長 9-10
  if (/^0[1-8]\d{7,8}$/.test(stripped)) {
    return { ok: true };
  }
  return { ok: false, error: 'errorPhone' };
}

/**
 * 驗證入住／退房日期區間。
 * 規則：
 *   - 兩個日期都必填且格式須為 yyyy-mm-dd
 *   - 入住不可早於今日
 *   - 退房必須晚於入住
 */
export function validateDateRange(
  checkIn: string,
  checkOut: string,
): FieldResult {
  if (!checkIn.trim() || !checkOut.trim()) {
    return { ok: false, error: 'errorRequired' };
  }
  const inDate = parseDateLocal(checkIn);
  const outDate = parseDateLocal(checkOut);
  if (!inDate || !outDate) {
    return { ok: false, error: 'errorRequired' };
  }
  if (inDate.getTime() < todayStart().getTime()) {
    return { ok: false, error: 'errorCheckInPast' };
  }
  if (outDate.getTime() <= inDate.getTime()) {
    return { ok: false, error: 'errorCheckOutBeforeIn' };
  }
  return { ok: true };
}

/**
 * 驗證入住人數（1-10）。
 * 接受 number；若呼叫端從 form 取到字串，請先 Number(value) 轉換。
 */
export function validateGuestCount(count: number): FieldResult {
  if (!Number.isFinite(count) || !Number.isInteger(count)) {
    return { ok: false, error: 'errorGuestsRange' };
  }
  if (count < 1 || count > 10) {
    return { ok: false, error: 'errorGuestsRange' };
  }
  return { ok: true };
}

/**
 * 驗證訊息內容（至少 10 個字、最多 2000 字）。
 * 計算用 Array.from(str).length 以正確計算 emoji / 中日韓字元（避免 surrogate pair 多算）。
 *
 * 上限 2000 字與 HTML maxlength="2000" 同步，防止：
 *   - 惡意大量資料灌入後端
 *   - Web3Forms email 內文過長被截斷
 *   - DoS 風險（client 端純函式仍應守上限以利伺服器端共用）
 */
export function validateMessage(message: string): FieldResult {
  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: 'errorRequired' };
  }
  const len = Array.from(trimmed).length;
  if (len < 10) {
    return { ok: false, error: 'errorMessageMin' };
  }
  if (len > 2000) {
    return { ok: false, error: 'errorMessageMax' };
  }
  return { ok: true };
}

/**
 * 驗證單純必填字串（去除前後空白後不可為空）。
 */
function validateRequired(value: string): FieldResult {
  if (!value.trim()) {
    return { ok: false, error: 'errorRequired' };
  }
  return { ok: true };
}

/**
 * 整張表單驗證入口。
 *
 * 容錯設計：
 *   - 任一子驗證失敗即在 errors 累積該欄位的 i18n key
 *   - ok = errors 是否為空，呼叫端不必再 walk
 *   - subject / roomPreference 視為「下拉選單」，僅檢查必填（值來自字典固定列表）
 */
export function validateContactForm(data: ContactFormData): FormResult {
  const errors: Record<string, string> = {};

  const nameResult = validateRequired(data.name);
  if (!nameResult.ok && nameResult.error) {
    errors.name = nameResult.error;
  }

  const emailResult = validateEmail(data.email);
  if (!emailResult.ok && emailResult.error) {
    errors.email = emailResult.error;
  }

  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.ok && phoneResult.error) {
    errors.phone = phoneResult.error;
  }

  const dateResult = validateDateRange(data.checkIn, data.checkOut);
  if (!dateResult.ok && dateResult.error) {
    errors.dateRange = dateResult.error;
  }

  const guestsResult = validateGuestCount(data.guests);
  if (!guestsResult.ok && guestsResult.error) {
    errors.guests = guestsResult.error;
  }

  const subjectResult = validateRequired(data.subject);
  if (!subjectResult.ok && subjectResult.error) {
    errors.subject = subjectResult.error;
  }

  // roomPreference 為「下拉偏好」非必填欄位：使用者可選「尚未決定／請推薦」（值為空字串），
  // 與 HTML 中該 select 不帶 required 一致。先前誤標為必填會導致 client / server 驗證錯位。
  // 不再呼叫 validateRequired(data.roomPreference)。

  const messageResult = validateMessage(data.message);
  if (!messageResult.ok && messageResult.error) {
    errors.message = messageResult.error;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
