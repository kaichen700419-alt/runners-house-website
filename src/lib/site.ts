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
  /** 民宿英文別名（schema.alternateName 中文版用） */
  alternateNameEn: 'Runners House Changbin',
  /** 民宿中文別名（schema.alternateName 英文版用） */
  alternateNameZh: '跑者之家',
  /** 品牌字標縮寫（Header 圓徽顯示用，固定為 Runners House 縮寫） */
  brandMark: 'RH',
  /** Open Graph 預設圖片（後續可由設計團隊覆蓋） */
  defaultOgImage: '/og/runners-house-default.jpg',
  /** Logo URL（schema.logo 用，相對於站點根） */
  logo: '/og/runners-house-default.jpg',
  /** 主機網址（含 protocol，無尾斜線） */
  url: SITE_URL,
  /** 預設語系 locale 字串（OG 用） */
  ogLocaleZh: 'zh_TW',
  ogLocaleEn: 'en_US',
  /** 價格區間（schema.priceRange 用，雙語通用） */
  priceRange: '$$',
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
  streetZh: '竹湖村 47 號（台 11 線 91K）',
  cityZh: '長濱鄉',
  regionZh: '台東縣',
  postalCode: '962',
  countryZh: '台灣',
  /** ISO 3166-1 alpha-2 國碼（schema.org addressCountry 偏好用 TW，避免 Google 解析全名失敗） */
  countryCode: 'TW',
  fullZh: '962 台東縣長濱鄉竹湖村 47 號（台 11 線 91K）',
  streetEn: 'No. 47, Zhuhu Village (Highway 11, KM 91)',
  cityEn: 'Changbin Township',
  regionEn: 'Taitung County',
  countryEn: 'Taiwan',
  fullEn: 'No. 47, Zhuhu Village, Changbin Township, Taitung County 962, Taiwan (Highway 11, KM 91)',
} as const;

/**
 * 業主確認的真實 GPS 座標（取自 Google Maps 實測）。
 * 23.282611°N, 121.427611°E — 台 11 線 91K，竹湖村 47 號正上方。
 * 注意：此值會傳入 schema.geo.GeoCoordinates 與 contact 頁 Google Maps iframe，
 * 任何修改都會同時影響 SEO 結構化資料與聯絡頁地圖位置，必須與業主重新確認。
 */
export const GEO = {
  latitude: 23.282611,
  longitude: 121.427611,
} as const;

export const HOURS = {
  checkin: '15:00',
  checkout: '11:00',
  /** 入住時段結束時間（21:00 後請事先聯繫） */
  checkinEnd: '21:00',
  frontDeskOpen: '09:00',
  frontDeskClose: '21:00',
} as const;

/**
 * 房型總數 — 對應 src/content/rooms/*.md 共 5 個 collection 檔案。
 * 用於 schema.numberOfRooms；若新增/刪除 collection 必須同步調整此值，
 * 並在房型列表頁可見 HTML 同步顯示，避免 schema 與頁面內容不一致。
 */
export const NUMBER_OF_ROOMS = 5;

/**
 * 業主政策設定（用於 schema.org petsAllowed / smokingAllowed 等布林欄位）。
 * 真實營業條件確認過：禁寵、禁菸、禁早餐、無一次性備品。
 */
export const POLICY = {
  petsAllowed: false,
  smokingAllowed: false,
  servesBreakfast: false,
  /** 訂金比例（用於 i18n 顯示與 schema.amenityFeature 註記） */
  depositRatio: 0.5,
} as const;

/**
 * 接受的付款方式（schema.paymentAccepted 用，逗號分隔字串）。
 * 業主確認：現金與銀行轉帳；不收信用卡。
 */
export const PAYMENT = {
  acceptedZh: '現金, 銀行轉帳',
  acceptedEn: 'Cash, Bank Transfer',
  currency: 'TWD',
} as const;

/**
 * 服務語言（schema.availableLanguage 用）。
 * 業主以中文為主、可基本英文應對。
 */
export const LANGUAGES = ['zh-TW', 'en'] as const;

/**
 * 民宿設施清單（schema.amenityFeature 用）。
 *
 * 每筆對應 schema.org LocationFeatureSpecification，
 * `value: true` 表示此設施為「有提供」。
 * 與業主確認過的真實設施：洗衣 / 烘衣 / 戶外停車 / Tesla 自費充電 / Wi-Fi / 空調 / 部分房型小廚房。
 *
 * 重要：amenity 內容會同時被頁面（runners 公共設施區、charging 規格區）顯示，
 * 任何新增/刪除必須與對應 i18n 字串同步，避免 schema vs HTML 不一致。
 */
export const AMENITIES = [
  { zh: '投幣式洗衣機', en: 'Coin-operated washing machine' },
  { zh: '投幣式烘衣機', en: 'Coin-operated dryer' },
  { zh: '戶外免費停車', en: 'Free outdoor parking' },
  { zh: 'Tesla Wall Connector 自費超充', en: 'Tesla Wall Connector (paid)' },
  { zh: '免費 Wi-Fi', en: 'Free Wi-Fi' },
  { zh: '空調', en: 'Air conditioning' },
  { zh: '部分房型附小廚房', en: 'Mini-kitchen in select rooms' },
] as const;
