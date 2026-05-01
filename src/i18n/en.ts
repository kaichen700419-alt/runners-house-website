/**
 * 英文字典
 *
 * 必須與 src/i18n/zh-TW.ts 維持完全一致的 key 樹。
 * 任何新增 / 移除 key 都必須兩邊同步，由 tests/unit/i18n.test.ts 強制檢查。
 */
import type { Dictionary } from './zh-TW';

const en: Dictionary = {
  common: {
    siteName: 'Runners House',
    tagline: 'A coastal home base for runners in Changbin, Taitung',
    brandStatement: 'Run · Stay · Charge — a reborn rice barn made for runners',
    callPhone: 'Call us',
    sendEmail: 'Send email',
    addLine: 'Add LINE',
    bookInquiry: 'Booking inquiry',
    learnMore: 'Learn more',
    backToHome: 'Back to home',
    copyright: '© {year} Runners House. All rights reserved.',
    languageLabel: 'Language',
    skipToContent: 'Skip to main content',
  },
  nav: {
    home: 'Home',
    about: 'Our Story',
    rooms: 'Rooms',
    runners: 'Runners',
    charging: 'Tesla Charging',
    nearby: 'Nearby',
    contact: 'Contact',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
  },
  footer: {
    contactHeading: 'Contact',
    quickLinksHeading: 'Quick Links',
    socialHeading: 'Follow & Map',
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    lineLabel: 'LINE Official',
    hoursHeading: 'Hours',
    hoursContent: 'Check-in from 15:00, check-out by 11:00; front desk 09:00–21:00',
    mapHeading: 'Google Map',
    mapAria: 'Runners House location on Google Maps',
    builtWith: 'Built with sea breeze, runner spirit, and Changbin sunrises.',
  },
  home: {
    heroEyebrow: 'Taitung · Changbin · Highway 11 · 91K',
    heroTitle: 'Running is the way home',
    heroSubtitle:
      'A reborn 1970s rice barn turned coastal stay for distance runners, road-trippers, and EV travelers — a real recharge stop on Taiwan’s east coast.',
    heroPrimaryCta: 'See rooms',
    heroSecondaryCta: 'Why runners come here',
    featuresHeading: 'Three reasons you’ll want to stay',
    featuresLead: 'Run, Stay, Charge — the things runners actually care about, done right.',
    featureRunTitle: 'Run · A runner’s home base',
    featureRunDescription:
      'Official refuel point for the Changbin King-Kong Marathon and Sanxiantai Half. Sunrise route maps, rinse stations, shoe-drying racks, and fuel on hand.',
    featureStayTitle: 'Stay · Rice-barn time',
    featureStayDescription:
      'Earthen walls, cypress beams, and ocean light kept intact. We keep the room count low so every traveler gets a quiet night.',
    featureChargeTitle: 'Charge · Tesla Wall Connector',
    featureChargeDescription:
      'One of the few paid Tesla Wall Connector stops along Highway 11 in Changbin — top up without range anxiety, even if you’re just passing through.',
    storyTeaserHeading: 'From rice barn to runner’s base',
    storyTeaserBody:
      'A returning long-distance runner kept the barn, kept the sea breeze, and kept the running. The rest of the house grew around it.',
    storyTeaserCta: 'Read the full story',
    locationHeading: 'Location & access',
    locationBody:
      'Approx. 90 min south from Hualien on Highway 11; 75 min north from Taitung City. Best reached by car or EV; free parking and paid Tesla charging on-site.',
  },
  about: {
    pageTitle: 'Our Story',
    pageLead: 'Runners House didn’t appear overnight — it’s the answer of a 50-year-old rice barn that finally got its turn.',
    originHeading: 'Origin · A barn waiting to breathe again',
    originBody:
      'Built by family elders in 1972 to store local rice, the barn fell silent for nearly thirty years as agriculture faded. The owner returned home to give it back to daily life.',
    hostHeading: 'Host · The one who ran home',
    hostBody:
      'A long-distance runner who literally ran from Taipei back to Changbin. He understands what runners actually need: a flat bed, hot water that washes off the salt, sunshine to dry shoes, and coffee with no schedule.',
    philosophyHeading: 'Philosophy · Run, Stay, Charge',
    philosophyBody:
      'Running, lingering, recharging — the three things modern travelers deserve to be treated kindly with. We hope this barn becomes a kind way station.',
    timelineHeading: 'Timeline',
    timeline1972: '1972 · The barn is built to store Changbin rice',
    timeline1995: '1995 · Agriculture wanes; the barn falls quiet',
    timeline2023: '2023 · The host returns home; restoration begins',
    timeline2025: '2025 · Runners House soft-opens',
    timeline2026: '2026 · Officially open to the public',
    sustainabilityHeading: 'Sustainability commitments',
    sustainabilityBody:
      'We keep the original timber and earthen walls wherever possible; deploy only low-energy AC and solar hot water; refill amenities in reusable bottles; and refuse single-use plastics.',
  },
  rooms: {
    pageTitle: 'Rooms',
    pageLead:
      'We deliberately cap the room count at four so every guest gets their own ocean view and quiet.',
    sizeLabel: 'Size',
    capacityLabel: 'Sleeps',
    bedLabel: 'Bed',
    viewLabel: 'View',
    priceLabel: 'From',
    seePriceCta: 'See details & book',
    capacityUnit: 'guests',
    sizeUnit: 'ping',
    priceFromLabel: 'from / night',
    priceNote: '*Rates vary by season and holidays. Contact us for the current price.',
    notIncludeMeals: 'No meals are served on-site; many local eateries are within walking distance.',
  },
  runners: {
    pageTitle: 'Runners',
    pageLead: 'More than a stay — a refuel point and training base for the Changbin coast.',
    eventsHeading: 'Home-base events',
    eventKingKongTitle: 'Changbin King-Kong Marathon',
    eventKingKongBody:
      'The most explosive Pacific-coast marathon. Guests get event discounts and a sunrise pace-leader service.',
    eventSanxiantaiTitle: 'Sanxiantai Sunrise Half',
    eventSanxiantaiBody:
      'A sunrise-themed course; Runners House is one of the official partner refuel points.',
    routesHeading: 'Sunrise routes',
    routesBody:
      'We provide 5K / 10K / 15K / 21K themed route maps with refuel points, restrooms, and ocean photo stops marked.',
    servicesHeading: 'Runner-friendly services',
    serviceShower: '24-hour hot rinse station to wash off salt',
    serviceDry: 'Outdoor drying rack for shoes and gear',
    serviceFuel: 'Energy gels and electrolytes (small paid stand)',
    serviceMassage: 'Local sports therapist available by appointment',
    serviceLaundry: 'Quick wash & dry — clean kit ready by morning',
  },
  charging: {
    pageTitle: 'Tesla Charging',
    pageLead:
      'One of the few legal, paid Tesla Wall Connector stops on the Changbin stretch of Highway 11.',
    serviceHeading: 'Paid charging service',
    serviceBody:
      'Guests enjoy discounted hourly plans; non-guests can reserve short top-up sessions. We use a trust-based deposit system and online scheduling to avoid plug conflicts.',
    specsHeading: 'Specs',
    specsConnector: 'Plug: Tesla Wall Connector (J1772 adapter available)',
    specsPower: 'Max output: 11.5 kW (48A / single phase)',
    specsCompat: 'Compatible: Model S/3/X/Y and Cybertruck',
    rulesHeading: 'House rules',
    ruleReserve: 'Reserve at least 2 hours ahead via LINE',
    ruleNoOvernight: 'Non-guests cannot occupy the charger overnight',
    ruleEtiquette: 'Unplug when full and log your session for the next driver',
  },
  nearby: {
    pageTitle: 'Nearby',
    pageLead:
      'Changbin has ocean, mountain, indigenous villages, and old shops. We don’t serve meals — the walking-distance options are simply too good.',
    spotsHeading: 'Sights',
    spotSanxiantai: 'Sanxiantai Eight-Arch Bridge · 25 min by car',
    spotShitiping: 'Shitiping intertidal flats · 20 min by car',
    spotJingpu: 'Jingpu Tropic of Cancer marker · 30 min by car',
    foodHeading: 'Local eats',
    foodMipan: 'Changbin Rice House · 5 min walk',
    foodCoffee: 'Coastline Coffee · 8 min walk',
    foodBakery: 'Changbin Hand-Bakery · 10 min walk',
    itineraryHeading: 'Suggested itinerary',
    itineraryBody:
      'Two days, one night: Day 1 coastal walk + village dinner; Day 2 sunrise run + Sanxiantai sunrise + return.',
    noMealsNotice: 'Note: Runners House does not serve meals. Ask us for today’s recommendations.',
  },
  contact: {
    pageTitle: 'Contact',
    pageLead: 'Reach out for booking, partnerships, press, or whole-house buyouts.',
    formNameLabel: 'Name',
    formEmailLabel: 'Email',
    formPhoneLabel: 'Phone',
    formSubjectLabel: 'Subject',
    formMessageLabel: 'Message',
    formSubmitLabel: 'Send inquiry',
    formSubjectBooking: 'Booking inquiry',
    formSubjectCharging: 'Tesla charging reservation',
    formSubjectCollab: 'Partnership',
    formSubjectMedia: 'Press / media',
    formSubjectOther: 'Other',
    errorRequired: 'This field is required',
    errorEmail: 'Please enter a valid email address',
    errorPhone: 'Please enter a valid phone number',
    errorMessageMin: 'Message must be at least 10 characters',
    successMessage: 'Got it — we’ll reply within 24 hours.',
    contactInfoHeading: 'Other ways to reach us',
    contactPreferLine: 'For bookings, LINE Official is the fastest channel.',
  },
  seo: {
    homeTitle: 'Runners House · Coastal Runner Stay in Changbin, Taitung',
    homeDescription:
      'A reborn rice-barn stay for runners on the Changbin coast: sunrise routes, runner gear services, paid Tesla charging, and quiet ocean rooms.',
    aboutTitle: 'Our Story · Runners House',
    aboutDescription:
      'From a 1972 rice barn to a runner’s base — read the host’s return-home story and our sustainability commitments.',
    roomsTitle: 'Rooms · Runners House',
    roomsDescription:
      'Four curated ocean-view rooms preserving the barn’s earthen walls and cypress beams — built for runners who need real sleep.',
    runnersTitle: 'Runners · King-Kong Marathon & Sunrise Routes · Runners House',
    runnersDescription:
      'Official refuel partner of the Changbin King-Kong Marathon and Sanxiantai Half — sunrise route maps, rinse stations, drying racks and fuel.',
    chargingTitle: 'Tesla Charging Service · Runners House',
    chargingDescription:
      'A legal, paid Tesla Wall Connector stop on Highway 11, Changbin — discounted plans for guests, reservable sessions for non-guests.',
    nearbyTitle: 'Nearby Sights & Local Eats · Runners House',
    nearbyDescription:
      'Sanxiantai, Shitiping, Jingpu Tropic-of-Cancer marker, and walkable Changbin eateries. We do not serve meals on-site.',
    contactTitle: 'Contact · Runners House',
    contactDescription:
      'Booking, Tesla charging reservation, partnerships, press, and buyouts — reach us via LINE, phone, or the contact form.',
  },
};

export default en;
