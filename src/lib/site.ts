/**
 * 站點全域常數
 *
 * 集中所有「品牌、聯絡方式、地理位置、行銷帳號」資訊，避免散落於元件中。
 * Schema.org 產生器、SEOHead、Footer、Header 皆從此檔取得單一真相。
 */

export const SITE_URL = 'https://runnershouse.tw';

export const SITE = {
  /** 中文官方名稱 */
  nameZh: '跑者之家 Runners House',
  /** 英文官方名稱 */
  nameEn: 'Runners House',
  /** Open Graph 預設圖片（後續可由設計團隊覆蓋） */
  defaultOgImage: '/og/runners-house-default.jpg',
  /** Apple touch icon */
  appleTouchIcon: '/favicon.svg',
  /** 主機網址（含 protocol，無尾斜線） */
  url: SITE_URL,
  /** 預設語系 locale 字串（OG 用） */
  ogLocaleZh: 'zh_TW',
  ogLocaleEn: 'en_US',
} as const;

export const CONTACT = {
  phone: '+886-89-100100',
  phoneDisplay: '089-100100',
  email: 'hello@runnershouse.tw',
  lineId: '@runnershouse',
  lineUrl: 'https://line.me/R/ti/p/@runnershouse',
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
