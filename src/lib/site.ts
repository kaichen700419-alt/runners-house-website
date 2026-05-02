/**
 * 站點全域常數
 *
 * 集中所有「品牌、聯絡方式、地理位置、行銷帳號」資訊，避免散落於元件中。
 * Schema.org 產生器、SEOHead、Footer、Header 皆從此檔取得單一真相。
 */

/**
 * 站點 URL — 僅含 origin（協定+主機名），不含子路徑。
 * 子路徑由 getLocalizedPath 透過 import.meta.env.BASE_URL 自動加上，
 * 兩者拼接後即為完整 canonical URL，避免雙重前綴問題。
 *
 * - production（自訂網域）→ https://runnershouse.tw
 * - gh-pages（GitHub Pages 預覽）→ https://kaichen700419-alt.github.io
 */
const DEPLOY_TARGET = process.env.DEPLOY_TARGET ?? 'production';
export const SITE_URL = DEPLOY_TARGET === 'gh-pages'
  ? 'https://kaichen700419-alt.github.io'
  : 'https://runnershouse.tw';

export const SITE = {
  /** 中文官方名稱 */
  nameZh: '跑者之家 Runners House',
  /** 英文官方名稱 */
  nameEn: 'Runners House',
  /** 品牌字標縮寫（Header 圓徽顯示用，固定為 Runners House 縮寫） */
  brandMark: 'RH',
  /** Open Graph 預設圖片（後續可由設計團隊覆蓋） */
  defaultOgImage: '/og/runners-house-default.jpg',
  /** 主機網址（含 protocol，無尾斜線） */
  url: SITE_URL,
  /** 預設語系 locale 字串（OG 用） */
  ogLocaleZh: 'zh_TW',
  ogLocaleEn: 'en_US',
} as const;

/**
 * 真實聯絡資料（單一真相）。
 *
 * 此處為跑者之家對外公開的真實電話、Email、LINE 與社群連結，
 * Footer / Schema.org / 聯絡頁 / 房型詳情頁 / ClosingCta / 充電頁皆從此檔取得，
 * 避免散落於 i18n 字典造成「中文與英文顯示不同電話」的雙真相 bug。
 *
 * - phone：對 tel: 用的 E.164 形式（含 + 與國碼，以 - 分組）
 * - phoneDisplay：對畫面顯示用的台灣慣用格式
 * - phonePrimary / phoneSecondary：主要與副線聯絡電話
 */
export const CONTACT = {
  phone: '+886-933-430-418',
  phoneDisplay: '0933-430-418',
  phonePrimary: '0933-430-418',
  phonePrimaryTel: '+886933430418',
  phoneSecondary: '0912-699-709',
  phoneSecondaryTel: '+886912699709',
  email: 'hello@runnershouse.tw',
  lineId: '@659gkrae',
  lineUrl: 'https://line.me/R/ti/p/%40659gkrae',
  facebookUrl: 'https://www.facebook.com/runnershouse.tw',
  instagramUrl: 'https://www.instagram.com/runnershouse.tw',
} as const;

export const ADDRESS = {
  streetZh: '台 11 線 91K 旁',
  cityZh: '長濱鄉',
  regionZh: '台東縣',
  postalCode: '962',
  countryZh: '台灣',
  fullZh: '962 台東縣長濱鄉台 11 線 91K 旁',
  streetEn: 'Highway 11, KM 91',
  cityEn: 'Changbin Township',
  regionEn: 'Taitung County',
  countryEn: 'Taiwan',
  fullEn: 'Highway 11 KM 91, Changbin Township, Taitung County 962, Taiwan',
} as const;

export const GEO = {
  latitude: 23.3221,
  longitude: 121.4612,
} as const;

export const HOURS = {
  checkin: '15:00',
  checkout: '11:00',
  frontDeskOpen: '09:00',
  frontDeskClose: '21:00',
} as const;

export const AMENITIES = [
  { zh: 'Tesla Wall Connector 自費超充', en: 'Tesla Wall Connector (paid)' },
  { zh: '跑者主場（晨跑路線、補給）', en: 'Runner home base (routes & fuel)' },
  { zh: '免費 Wi-Fi', en: 'Free Wi-Fi' },
  { zh: '免費停車場', en: 'Free parking' },
  { zh: '24 小時熱水沖洗區', en: '24-hour hot rinse station' },
  { zh: '快洗烘衣間', en: 'Quick wash & dry' },
] as const;
