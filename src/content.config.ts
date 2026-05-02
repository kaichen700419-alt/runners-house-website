/**
 * Astro Content Collections 設定
 *
 * 定義 5 個 collection：rooms / races / routes / attractions / restaurants。
 * 每個 collection 採 Markdown 檔（位於 src/content/<collection>/*.md），
 * 透過 zod schema 強制 frontmatter 結構，避免錯字段或缺欄位的內容流向頁面。
 *
 * 中英欄位採 `*_zh` / `*_en` 並列：
 *   - 此網站只有 zh-TW + en 兩個語系，攤平命名比 nested locale object 更易讀寫
 *   - 頁面層依 locale 取對應欄位，少一層 nested access
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * https-only URL schema：拒絕 http、javascript:、data: 等危險協定。
 * z.url() 預設只檢查語法合法性，不限制 protocol；本站對外連結（賽事報名、地圖、社群）
 * 一律應為 https，避免使用者被導向不安全的 mixed content 或 XSS payload。
 */
const httpsUrl = () =>
  z
    .url()
    .refine((url) => /^https:\/\//i.test(url), {
      message: 'URL 必須以 https:// 開頭',
    });

const rooms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/rooms' }),
  schema: z.object({
    /** 房型唯一 slug（同檔名，會出現在 /rooms/[slug] URL） */
    slug: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    /** 坪數（純數字，畫面上補單位） */
    size: z.number().positive(),
    /** 入住人數 */
    capacity: z.number().int().positive(),
    beds_zh: z.string(),
    beds_en: z.string(),
    view_zh: z.string(),
    view_en: z.string(),
    amenities_zh: z.array(z.string()).min(1),
    amenities_en: z.array(z.string()).min(1),
    description_zh: z.string(),
    description_en: z.string(),
    /** 相簿圖片 alt 文字陣列；目前未提供實景，改用 ImagePlaceholder 元件渲染 */
    gallery: z.array(z.string()).min(1),
    /** 參考價格說明（文字，不是純數字以容納「請致電詢問」等彈性表達） */
    price_note_zh: z.string(),
    price_note_en: z.string(),
    /** 列表排序，數字小者排前面 */
    order: z.number().int(),
  }),
});

const races = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/races' }),
  schema: z.object({
    id: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    /** 賽事舉辦月份（1-12） */
    month: z.number().int().min(1).max(12),
    /** 距離標示（如 42K、21K，文字以容納全馬/半馬/超半等） */
    distance: z.string(),
    description_zh: z.string(),
    description_en: z.string(),
    registrationUrl: httpsUrl(),
    /** 賽事代表圖 alt 文字 */
    image: z.string(),
    order: z.number().int(),
  }),
});

const routes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/routes' }),
  schema: z.object({
    id: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    distance: z.string(),
    /** 海拔變化文字（如「+15m / -15m」） */
    elevation: z.string(),
    description_zh: z.string(),
    description_en: z.string(),
    mapUrl: httpsUrl(),
    /** 難度：easy/moderate/hard（頁面層映射為 i18n 字串） */
    difficulty: z.enum(['easy', 'moderate', 'hard']),
    image: z.string(),
    order: z.number().int(),
  }),
});

const attractions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/attractions' }),
  schema: z.object({
    id: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    /** 自駕單程約略時間（分鐘） */
    distanceMin: z.number().int().positive(),
    description_zh: z.string(),
    description_en: z.string(),
    mapUrl: httpsUrl(),
    image: z.string(),
    order: z.number().int(),
  }),
});

const restaurants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/restaurants' }),
  schema: z.object({
    id: z.string(),
    name_zh: z.string(),
    name_en: z.string(),
    type_zh: z.string(),
    type_en: z.string(),
    distanceMin: z.number().int().positive(),
    description_zh: z.string(),
    description_en: z.string(),
    image: z.string(),
    order: z.number().int(),
  }),
});

export const collections = {
  rooms,
  races,
  routes,
  attractions,
  restaurants,
};
