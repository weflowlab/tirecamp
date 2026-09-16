/**
 * 얼라이먼트 가격표 이미지 — 원본 그림을 그대로 두고 "전기차" 박스 색만 바꾼다.
 *   node scripts/recolor-price-align.mjs
 *
 * 입력 : scripts/assets/price-align.base.webp (손대지 않은 원본, 절대 덮어쓰지 말 것)
 * 출력 : public/images/home/price-align.webp
 *
 * 파란색(#2962B8) "전기차" 박스 → 휠 밸런스 머리띠와 같은 초록(#3F6D59).
 * 파랑은 위치 교환 머리띠의 청록(#2E7D90)과 색이 가까워서 전체를 훑으면 같이 물든다.
 * → 파란 덩어리의 사각 범위를 먼저 찾고, 그 안에서만 색을 옮긴다.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const fs = require("node:fs");

const BASE = "scripts/assets/price-align.base.webp";
const OUT = "public/images/home/price-align.webp";

/* 구분 칸의 차종 예시 — 금액이 달라지는 기준이라 대표님 확인 후 고칠 것.
   x/baseline 은 원본 라벨(경형·중소형·중대형·수입차)의 글자 끝과 밑선을 재서 맞춘 값이라,
   라벨과 같은 줄에 이어 붙는다. 크기·굵기·색도 원본 라벨과 같게 맞췄다. */
/* "경형"은 두 글자라 아래 세 글자 라벨(중소형·중대형·수입차)보다 짧다.
   → "형" 글자만 오른쪽으로 옮겨 끝을 맞춘다 ("경   형"). 원본 글자를 그대로 옮기는 것이라 모양은 안 변한다. */
const GYEONG = { from: [186, 212], to: 216, band: [248, 296] }; // "형"의 x 범위 → 옮길 x, 건드릴 y 구간

const EXAMPLES = [
  [258, 282, "(모닝 · 레이 · 캐스퍼)"], // 경형 — 라벨 끝이 아래 줄들과 같아져 시작 x 도 같게
  [258, 386, "(소나타 · K5 · 아반떼)"], // 중소형
  [258, 490, "(소렌토 · 산타페 · 그랜저)"], // 중대형
  [258, 589, "(벤츠 · BMW · 아우디)"], // 수입차
];
const EX_SIZE = 30; // 라벨(36px)보다 한 단계 작게 — 밑선은 라벨과 같이 둔다
const EX_WEIGHT = 400;
const EX_FILL = "#70747C";

const BLUE = [41, 98, 184]; // #2962B8 전기차 박스
const GREEN = [63, 109, 89]; // #3F6D59 휠 밸런스 머리띠
const SOLID = 26; // 이만큼 가까우면 "칠해진 파랑"
const EDGE = 90; // 범위 안에서 흐린 경계는 가까운 만큼만 옮긴다

const dist = (r, g, b, [R, G, B]) => Math.hypot(r - R, g - G, b - B);

const { data, info } = await sharp(BASE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: CH } = info;
const at = (x, y) => (y * W + x) * CH;

/* 파란 덩어리의 범위 찾기 */
let x0 = W;
let x1 = -1;
let y0 = H;
let y1 = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = at(x, y);
    if (dist(data[i], data[i + 1], data[i + 2], BLUE) < SOLID) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
}
if (x1 < 0) throw new Error("파란 박스를 못 찾음");
console.log(`  전기차 박스 ${x0},${y0} ~ ${x1},${y1}`);

/* 그 안에서만 파랑 → 초록 */
const d = [GREEN[0] - BLUE[0], GREEN[1] - BLUE[1], GREEN[2] - BLUE[2]];
for (let y = Math.max(0, y0 - 4); y <= Math.min(H - 1, y1 + 4); y++) {
  for (let x = Math.max(0, x0 - 4); x <= Math.min(W - 1, x1 + 4); x++) {
    const i = at(x, y);
    const w = 1 - dist(data[i], data[i + 1], data[i + 2], BLUE) / EDGE;
    if (w <= 0) continue;
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + w * d[c])));
  }
}

/* "경형"의 "형" 글자를 오른쪽으로 옮겨 아래 세 글자 라벨과 끝을 맞춘다 */
{
  const [gx0, gx1] = GYEONG.from;
  const [gy0, gy1] = GYEONG.band;
  const w = gx1 - gx0 + 1;
  const h = gy1 - gy0 + 1;
  const buf = Buffer.alloc(w * h * CH);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < CH; c++) buf[(y * w + x) * CH + c] = data[at(gx0 + x, gy0 + y) + c];
  const bg = [data[at(gx0, gy0) ], data[at(gx0, gy0) + 1], data[at(gx0, gy0) + 2]]; // 칸 배경(흰색)
  for (let y = gy0; y <= gy1; y++) for (let x = gx0; x <= gx1; x++) {
    const i = at(x, y);
    data[i] = bg[0];
    data[i + 1] = bg[1];
    data[i + 2] = bg[2];
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < CH; c++) data[at(GYEONG.to + x, gy0 + y) + c] = buf[(y * w + x) * CH + c];
  console.log(`  "형" 을 x ${gx0} → ${GYEONG.to} 로 옮겨 라벨 끝 맞춤`);
}

/* 구분 칸에 차종 예시 얹기 (경형 · 중소형 · 중대형 · 수입차 라벨 오른쪽) */
const labels = EXAMPLES.map(
  ([x, y, s]) =>
    `<text x="${x}" y="${y}" font-family="Apple SD Gothic Neo, AppleGothic, sans-serif" font-size="${EX_SIZE}" font-weight="${EX_WEIGHT}" fill="${EX_FILL}">${s}</text>`,
).join("");
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`;

await sharp(data, { raw: { width: W, height: H, channels: CH } })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .webp({ quality: 92 })
  .toFile(OUT + ".tmp");
fs.renameSync(OUT + ".tmp", OUT);
console.log(`${OUT} ${W}x${H} — 전기차 박스 초록 + 차종 예시 4줄`);
