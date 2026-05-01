/**
 * 繁體中文字典（預設語系）
 *
 * 結構規範：以 namespace 為頂層 key，namespace 內部僅允許「物件」或「字串葉節點」。
 * 任何使用者可見字串都必須來自此檔，禁止寫死於元件內。
 * 對應的 en 字典（src/i18n/en.ts）必須維持與本檔相同的 key 樹。
 */

/**
 * 將 const-asserted 物件的 string literal 葉節點放寬為 `string`，
 * 以便讓其他語系字典可填入任意翻譯內容、同時維持結構一致。
 *
 * **警戒（branded string）**：
 *   `T[K] extends string` 為 distributive conditional type，會把所有「結構上等於 string」的型別
 *   一併映射為寬鬆 `string`。若日後字典葉節點引入 branded string（如
 *   `type SafeHtml = string & { readonly __safeHtml: unique symbol }`），
 *   此處會把 brand 抹除掉，導致下游元件失去型別保護。屆時需重新評估：
 *     - 改用 `T[K] extends string & infer Brand ? Brand & string : ...` 之類保留 brand 的策略
 *     - 或為 branded 葉節點另開分支不走 Loosen
 *   目前字典僅含純文字字面值，暫無此風險。
 */
type Loosen<T> = {
  [K in keyof T]: T[K] extends string ? string : Loosen<T[K]>;
};

const zhTW = {
  common: {
    siteName: '跑者之家 Runners House',
    tagline: '台東長濱海邊的跑者主場',
    brandStatement: 'Run · Stay · Charge — 為跑者重生的米倉民宿',
    callPhone: '撥打電話',
    sendEmail: '寄送 Email',
    addLine: '加 LINE 好友',
    bookInquiry: '詢問訂房',
    learnMore: '了解更多',
    backToHome: '回到首頁',
    copyright: '© {year} 跑者之家 Runners House. 版權所有。',
    /** 含多個 placeholder 的版權長版（多語系插值測試用，預留 Footer 富版權使用） */
    copyrightLong: '© {year} {site} · {tagline}',
    languageLabel: '語言',
    skipToContent: '跳至主要內容',
  },
  nav: {
    home: '首頁',
    about: '品牌故事',
    rooms: '房型介紹',
    runners: '跑者主場',
    charging: '特斯拉超充',
    nearby: '周邊景點',
    contact: '聯絡我們',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
  },
  footer: {
    contactHeading: '聯絡資訊',
    quickLinksHeading: '快速連結',
    socialHeading: '追蹤與地圖',
    addressLabel: '地址',
    phoneLabel: '電話',
    emailLabel: 'Email',
    lineLabel: 'LINE 官方帳號',
    hoursHeading: '營業時間',
    hoursContent: '入住 15:00 起／退房 11:00 前；櫃台服務 09:00–21:00',
    mapHeading: 'Google 地圖',
    mapAria: '跑者之家 Google 地圖位置',
    builtWith: '由海風、跑者熱情與長濱日出共同打造。',
    facebook: 'Facebook',
    instagram: 'Instagram',
    line: 'LINE',
  },
  home: {
    heroEyebrow: '台東 · 長濱 · 台 11 線 91K',
    heroTitle: '跑步就是回家的路',
    heroSubtitle:
      '一棟由 1970 年代廢棄米倉重生的海邊民宿，為長距離跑者、自駕旅人、電動車車主，預備了一個能真正放鬆的補給站。',
    heroPrimaryCta: '查看房型',
    heroSecondaryCta: '為什麼是跑者之家',
    featuresHeading: '三個讓你想留下來的理由',
    featuresLead: 'Run、Stay、Charge — 我們把跑者真正在意的事，做到位。',
    featureRunTitle: 'Run · 跑者主場',
    featureRunDescription:
      '長濱金剛馬、三仙台馬主場補給點；晨跑路線地圖、淋浴沖洗區、跑鞋曬乾架、能量補給品全備齊。',
    featureStayTitle: 'Stay · 米倉時光',
    featureStayDescription:
      '夯土牆、檜木樑與海光留下的呼吸感；房間數刻意保持稀少，讓每位旅人擁有靜謐的睡眠。',
    featureChargeTitle: 'Charge · 特斯拉超充',
    featureChargeDescription:
      '台 11 線少數提供自費 Tesla Wall Connector 的住宿點；非住客也能短時補電，讓電動車旅人不再焦慮。',
    storyTeaserHeading: '從米倉到跑者基地',
    storyTeaserBody:
      '主理人是一位返鄉的長距離跑者，與爺爺的稻穀一起長大。把米倉留下來，把海風留下來，把跑步留下來。',
    storyTeaserCta: '閱讀完整故事',
    locationHeading: '位置與交通',
    locationBody:
      '南下：花蓮台 11 線約 90 分鐘；北上：台東市區約 75 分鐘。建議自駕或電動車前來，現場提供免費停車與付費超充。',
  },
  about: {
    pageTitle: '品牌故事',
    pageLead: '跑者之家不是一夜之間冒出來的民宿，是 50 年米倉沉默的回答。',
    originHeading: '起源 · 一座等待重新呼吸的米倉',
    originBody:
      '老屋於 1972 年由家族長輩興建，最初是儲存稻穀的米倉。隨著農業沒落而閒置近三十年，直到主理人決定回鄉，把這棟看海的米倉重新交給生活。',
    hostHeading: '主理人 · 跑著回家的人',
    hostBody:
      '從台北一路跑回長濱的長距離跑者，理解跑者真正需要什麼：一張平整的床、可以洗去鹽分的熱水、可以晾鞋的陽光、與一杯不必趕路的咖啡。',
    philosophyHeading: '理念 · Run, Stay, Charge',
    philosophyBody:
      '跑步、停留、充電，是這個時代的旅人需要被善待的三件事。我們希望這棟米倉成為一個善意的中繼站。',
    timelineHeading: '時間軸',
    timeline1972: '1972 · 米倉落成，存放長濱稻米',
    timeline1995: '1995 · 農業沒落，米倉閒置',
    timeline2023: '2023 · 主理人返鄉，啟動修復計畫',
    timeline2025: '2025 · 跑者之家試營運',
    timeline2026: '2026 · 正式對外營業',
    sustainabilityHeading: '永續承諾',
    sustainabilityBody:
      '保留可保留的舊木與夯土；只導入低耗能空調與太陽能熱水；備品採可重複使用容器；不提供一次性塑膠。',
  },
  rooms: {
    pageTitle: '房型介紹',
    pageLead:
      '我們刻意把房間數壓在 4 間以內，讓每位旅人都能擁有自己的海景與安靜。',
    sizeLabel: '坪數',
    capacityLabel: '可入住',
    bedLabel: '床型',
    viewLabel: '景觀',
    priceLabel: '參考價',
    seePriceCta: '查看詳情與訂房',
    capacityUnit: '人',
    sizeUnit: '坪',
    priceFromLabel: '起／晚',
    priceNote: '*實際價格依季節與長短假期浮動，詳情請洽詢訂房。',
    notIncludeMeals: '本民宿不提供餐點，附近步行可達多家在地店家。',
  },
  runners: {
    pageTitle: '跑者主場',
    pageLead: '不只是民宿，是長濱海岸線跑者的補給站與訓練基地。',
    eventsHeading: '主場賽事',
    eventKingKongTitle: '長濱金剛馬拉松',
    eventKingKongBody:
      '太平洋海岸線最具爆發力的馬拉松，住客可獲得賽事優惠與晨跑領跑服務。',
    eventSanxiantaiTitle: '三仙台超半馬',
    eventSanxiantaiBody:
      '日出主題的賽事路線，跑者之家為官方合作補給點之一。',
    routesHeading: '晨跑路線',
    routesBody:
      '提供 5K／10K／15K／21K 四條主題路線地圖，含補給點、廁所、海景拍照點標註。',
    servicesHeading: '跑者友善服務',
    serviceShower: '24 小時熱水沖洗區，可洗去鹽分',
    serviceDry: '室外跑鞋與裝備曬乾架',
    serviceFuel: '能量包與電解質補給（自費小販售區）',
    serviceMassage: '可預約在地理療師到府按摩',
    serviceLaundry: '快洗烘衣間，比賽隔日可帶乾淨衣物上路',
  },
  charging: {
    pageTitle: '特斯拉超充服務',
    pageLead:
      '台 11 線長濱段少數提供 Tesla Wall Connector 的合法自費充電點。',
    serviceHeading: '付費充電服務',
    serviceBody:
      '住客享優惠時數方案，非住客可預約短時補電。採信任投幣機制與線上排程，避免插槍衝突。',
    specsHeading: '充電規格',
    specsConnector: '插頭：Tesla Wall Connector（J1772 轉接器另備）',
    specsPower: '最大輸出：11.5 kW（48A／單相）',
    specsCompat: '相容車種：Model S/3/X/Y 與 Cybertruck',
    rulesHeading: '使用規則',
    ruleReserve: '請提前 2 小時於 LINE 預約時段',
    ruleNoOvernight: '非住客不提供整夜佔用充電',
    ruleEtiquette: '充飽請禮讓下一位，並回填使用紀錄',
  },
  nearby: {
    pageTitle: '周邊景點',
    pageLead:
      '長濱有海、有山、有部落、有老店；我們不提供餐點，因為步行可達的選擇太迷人。',
    spotsHeading: '景點推薦',
    spotSanxiantai: '三仙台跨海八拱橋｜車程 25 分鐘',
    spotShitiping: '石梯坪潮間帶｜車程 20 分鐘',
    spotJingpu: '靜浦北回歸線｜車程 30 分鐘',
    foodHeading: '在地美食',
    foodMipan: '長濱米飯館｜步行 5 分鐘',
    foodCoffee: '長濱海岸線咖啡｜步行 8 分鐘',
    foodBakery: '長濱手工麵包坊｜步行 10 分鐘',
    itineraryHeading: '建議行程',
    itineraryBody:
      '兩日一夜建議：第一日海岸線散步＋部落晚餐；第二日晨跑＋三仙台日出＋返程。',
    noMealsNotice: '提醒：跑者之家本身不供餐，住客可向我們詢問當日推薦店家。',
  },
  contact: {
    pageTitle: '聯絡我們',
    pageLead: '訂房、合作、媒體採訪與包棟詢問都歡迎透過下列方式聯繫。',
    formNameLabel: '稱呼',
    formEmailLabel: 'Email',
    formPhoneLabel: '聯絡電話',
    formSubjectLabel: '詢問主題',
    formMessageLabel: '訊息內容',
    formSubmitLabel: '送出詢問',
    formSubjectBooking: '訂房詢問',
    formSubjectCharging: '超充預約',
    formSubjectCollab: '合作提案',
    formSubjectMedia: '媒體採訪',
    formSubjectOther: '其他',
    errorRequired: '此欄位為必填',
    errorEmail: '請輸入正確的 Email 格式',
    errorPhone: '請輸入正確的電話號碼',
    errorMessageMin: '訊息內容至少 10 個字',
    successMessage: '已收到您的訊息，我們會在 24 小時內回覆。',
    contactInfoHeading: '其他聯絡方式',
    contactPreferLine: '訂房優先建議使用 LINE 官方帳號，回覆最快。',
  },
  seo: {
    homeTitle: '跑者之家 Runners House｜台東長濱跑者主題民宿',
    homeDescription:
      '台東長濱海邊老米倉重生的跑者主題民宿，提供晨跑路線、跑者裝備服務、Tesla 自費超充與寧靜海景房。',
    aboutTitle: '品牌故事｜跑者之家 Runners House',
    aboutDescription:
      '從 1972 年米倉到跑者基地，閱讀主理人返鄉的故事與我們的永續承諾。',
    roomsTitle: '房型介紹｜跑者之家 Runners House',
    roomsDescription:
      '4 間以內精選海景房型，每間都保留老米倉的夯土與檜木樑，給跑者最安靜的睡眠。',
    runnersTitle: '跑者主場｜長濱金剛馬與晨跑路線｜跑者之家',
    runnersDescription:
      '長濱金剛馬、三仙台超半馬合作補給點，提供晨跑路線地圖、沖洗區、跑鞋曬乾與能量補給。',
    chargingTitle: 'Tesla 超充服務｜跑者之家 Runners House',
    chargingDescription:
      '台 11 線長濱段合法自費 Tesla Wall Connector 充電服務，住客優惠、非住客可預約。',
    nearbyTitle: '周邊景點與在地美食｜跑者之家',
    nearbyDescription:
      '三仙台、石梯坪、靜浦北回歸線景點與長濱在地美食推薦，本民宿不供餐。',
    contactTitle: '聯絡我們｜跑者之家 Runners House',
    contactDescription:
      '訂房、Tesla 超充預約、合作提案、媒體採訪與包棟詢問請透過 LINE、電話或表單聯繫。',
  },
} as const;

export default zhTW;
/** 字典結構型別（葉節點放寬為 string，供 en 等其他語系滿足同樣 shape）。 */
export type Dictionary = Loosen<typeof zhTW>;
