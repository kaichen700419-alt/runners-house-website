import sharp from 'sharp';
import fs from 'node:fs';

// 生成 OG 圖（1200x630，深木色 + 米色文字 + 細邊框）
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2d2520"/>
      <stop offset="50%" stop-color="#1a1411"/>
      <stop offset="100%" stop-color="#251c16"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#8b6f47" stroke-width="1" opacity="0.45"/>
  <text x="600" y="140" font-family="Noto Sans TC, sans-serif" font-size="22" letter-spacing="6" fill="#b89e75" text-anchor="middle">TAITUNG · CHANGBIN · COASTAL HIGHWAY 11</text>
  <text x="600" y="290" font-family="Noto Serif TC, serif" font-size="86" font-weight="600" fill="#f5efe5" text-anchor="middle" letter-spacing="4">跑者之家</text>
  <text x="600" y="375" font-family="Cormorant Garamond, serif" font-style="italic" font-size="42" fill="#d6c2a3" text-anchor="middle" letter-spacing="2">Runners House</text>
  <line x1="540" y1="425" x2="660" y2="425" stroke="#8b6f47" stroke-width="1.5"/>
  <text x="600" y="490" font-family="Noto Sans TC, sans-serif" font-size="24" fill="#c8bea5" text-anchor="middle" letter-spacing="3">廢棄米倉重生 · 跑者主場 · 海岸隱逸</text>
  <text x="600" y="560" font-family="Noto Sans TC, sans-serif" font-size="18" fill="#8b6f47" text-anchor="middle" letter-spacing="4">RUN · STAY · CHARGE</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
const jpg = await sharp(png).jpeg({ quality: 90 }).toBuffer();
fs.writeFileSync('public/og/runners-house-default.jpg', jpg);
console.log('OG 圖已生成：public/og/runners-house-default.jpg', jpg.length, 'bytes');
