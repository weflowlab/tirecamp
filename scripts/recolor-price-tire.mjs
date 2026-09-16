/**
 * 타이어 교체 가격표 이미지 — 원본 그림을 "다시 그리지 않고" 부분만 고친다.
 *   node scripts/recolor-price-tire.mjs
 *
 * 입력 : scripts/assets/price-tire.base.webp  (손대지 않은 원본, 절대 덮어쓰지 말 것)
 * 출력 : public/images/home/price-tire.webp
 *
 * 하는 일 (원본 픽셀을 그대로 옮기기만 한다 — 글꼴·자간·크기는 원본 그대로)
 *   1) 남색(#173250) 덩어리 → 청록(#2E7D90)  : 승용/SUV 머리띠 · 아래 아이콘 원 2개
 *      제목 글자도 같은 남색이라 색으로는 못 가린다 → "크고 속이 꽉 찬" 덩어리만 고른다
 *   2) [본 매장 교체시 장착비 포함] 얹기
 *
 * 아래 두 가지는 만들어 뒀지만 "원본과 너무 달라진다"는 판단으로 꺼 둔 상태다.
 * 다시 켜려면 LEFT_ALIGN = true / GROW = 140 으로 바꾸고, app/page.tsx 의 <img height> 도 같이 고칠 것.
 *   · 첫 열(규격/적용 · 항목) 글자를 왼쪽으로 : 글자 덩어리를 오려서 옮기고 빈 자리는 칸 배경색으로
 *   · 행 세로 간격 늘리기                    : 글자가 없는 가로줄을 복제해 끼워 넣는다
 *
 * 표 크기가 바뀌면 app/page.tsx 의 <img height> 도 같이 고칠 것 (아래 로그가 알려준다).
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const fs = require("node:fs");

const BASE = "scripts/assets/price-tire.base.webp";
const OUT = "public/images/home/price-tire.webp";

/* ---------- 원본에서 잰 표의 선 위치 ---------- */
const CARD = {
  left: { x0: 44, x1: 887, col0: [46, 400], rows: [[334, 432], [433, 532], [533, 632], [633, 732], [733, 833]] },
  right: { x0: 912, x1: 1755, col0: [914, 1372], rows: [[334, 457], [458, 582], [583, 707], [708, 833]] },
  // (아래 모서리 곡선은 카드 바닥에서 약 12px 구간 — schedule() 에서 16px 여유로 피한다)
};
const HEAD_ROW = [260, 332]; // 열 이름 줄 (두 카드 공통)
const TABLE = [334, 833]; // 행이 놓인 구간
const SPLIT_X = 900; // 왼쪽 카드 / 오른쪽 카드를 가르는 x
const LEFT_ALIGN = false; // 첫 열 왼쪽 정렬 (꺼 둠 — 원본 그대로 가운데)
const PAD = 36; // 왼쪽 정렬 시 칸 안쪽 여백
const BIAS = 3; // 글자를 칸 정중앙에서 이만큼 아래로 (한글은 정중앙이면 살짝 올라가 보인다)
const GROW = 0; // 카드 하나가 늘어나는 총 높이 (0 = 행 간격 원본 그대로)

const NAVY = [23, 50, 80];
const TEAL = [46, 125, 144];
const SOLID = 26; // 이만큼 가까우면 "칠해진 남색"
const EDGE = 120; // 경계의 흐린 픽셀은 가까운 만큼만 옮긴다
const INK = 190; // 이보다 어두우면 글자로 본다

const NOTE = "[본 매장 교체시 장착비 포함]";
const NOTE_XY = [338, 220];

const { data, info } = await sharp(BASE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: CH } = info;
const at = (x, y) => (y * W + x) * CH;
const dist = (r, g, b, [R, G, B]) => Math.hypot(r - R, g - G, b - B);
const isInk = (x, y) => {
  const i = at(x, y);
  return data[i] < INK && data[i + 1] < INK && data[i + 2] < INK;
};

/* ---------- 1) 남색 → 청록 ---------- */
{
  const navy = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) {
    const i = p * CH;
    if (dist(data[i], data[i + 1], data[i + 2], NAVY) < SOLID) navy[p] = 1;
  }
  const seen = new Uint8Array(W * H);
  const d = [TEAL[0] - NAVY[0], TEAL[1] - NAVY[1], TEAL[2] - NAVY[2]];
  for (let p0 = 0; p0 < W * H; p0++) {
    if (!navy[p0] || seen[p0]) continue;
    const stack = [p0];
    seen[p0] = 1;
    let n = 0;
    let x0 = W;
    let x1 = 0;
    let y0 = H;
    let y1 = 0;
    while (stack.length) {
      const p = stack.pop();
      const x = p % W;
      const y = (p - x) / W;
      n++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      const next = [];
      if (x > 0) next.push(p - 1);
      if (x < W - 1) next.push(p + 1);
      if (y > 0) next.push(p - W);
      if (y < H - 1) next.push(p + W);
      for (const q of next) {
        if (!navy[q] || seen[q]) continue;
        seen[q] = 1;
        stack.push(q);
      }
    }
    // 글자 획은 작고 성글다 → 크고 꽉 찬 것만 (머리띠 · 아이콘 원)
    if (!(n > 2000 && n / ((x1 - x0 + 1) * (y1 - y0 + 1)) > 0.6)) continue;
    for (let y = Math.max(0, y0 - 4); y <= Math.min(H - 1, y1 + 4); y++) {
      for (let x = Math.max(0, x0 - 4); x <= Math.min(W - 1, x1 + 4); x++) {
        const i = at(x, y);
        const w = 1 - dist(data[i], data[i + 1], data[i + 2], NAVY) / EDGE;
        if (w <= 0) continue;
        for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + w * d[c])));
      }
    }
    console.log(`  1) 남색 덩어리 ${x0},${y0} ~ ${x1},${y1} → 청록`);
  }
}

/* ---------- 2) 첫 열 글자 왼쪽으로 ---------- */
function leftAlign(cx0, cx1, ry0, ry1) {
  // 칸 안쪽. 왼쪽은 12px 을 비워 둔다 — 카드 아래 모서리 곡선이 안쪽으로 말려 들어오는데,
  // 거기까지 지우면 둥근 테두리가 끊긴다 (글자는 어차피 훨씬 오른쪽에서 시작)
  const ax0 = cx0 + 12;
  const ax1 = cx1 - 2;
  const ay0 = ry0 + 2;
  const ay1 = ry1 - 2;
  let x0 = ax1;
  let x1 = ax0;
  for (let y = ay0; y <= ay1; y++) for (let x = ax0; x <= ax1; x++) if (isInk(x, y)) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
  }
  if (x1 < x0) return; // 글자 없음
  const target = cx0 + PAD;
  // 긴 글자는 원래 위치가 목표보다 왼쪽일 수 있다 → 그때도 오른쪽으로 밀어 시작점을 맞춘다
  if (x0 === target) return;
  if (target + (x1 - x0) > ax1) return; // 옮기면 칸을 넘치는 경우만 그대로 둔다
  const bg = [data[at(ax0 + 2, ay0 + 2)], data[at(ax0 + 2, ay0 + 2) + 1], data[at(ax0 + 2, ay0 + 2) + 2]];
  // 글자 덩어리 복사 → 칸 비우기 → 옮겨 붙이기
  const w = x1 - x0 + 1;
  const h = ay1 - ay0 + 1;
  const buf = Buffer.alloc(w * h * CH);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < CH; c++) buf[(y * w + x) * CH + c] = data[at(x0 + x, ay0 + y) + c];
  for (let y = ay0; y <= ay1; y++) for (let x = ax0; x <= ax1; x++) {
    const i = at(x, y);
    data[i] = bg[0];
    data[i + 1] = bg[1];
    data[i + 2] = bg[2];
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const tx = target + x;
    if (tx < ax0 || tx > ax1) continue;
    for (let c = 0; c < CH; c++) data[at(tx, ay0 + y) + c] = buf[(y * w + x) * CH + c];
  }
}
if (LEFT_ALIGN) {
  for (const key of ["left", "right"]) {
    const c = CARD[key];
    leftAlign(c.col0[0], c.col0[1], HEAD_ROW[0], HEAD_ROW[1]);
    for (const [a, b] of c.rows) leftAlign(c.col0[0], c.col0[1], a + 1, b - 1);
  }
  console.log("  2) 첫 열(규격/적용 · 항목) 왼쪽 정렬");
}

/* ---------- 3) 행 세로 간격 늘리기 ---------- */
/** 카드의 각 행마다 빈 줄을 끼워 넣어, 출력 y → 원본 y 표를 만든다.
 *  - 넣는 양은 글자가 넓어진 칸의 정확한 가운데로 오도록 위/아래로 나눈다
 *    (원본부터 글자가 칸 중심보다 살짝 아래였는데, 이참에 같이 맞춘다)
 *  - 복제할 빈 줄은 글자가 없고 카드 모서리 곡선에도 닿지 않는 y 로 고른다
 *    (곡선 구간을 복제하면 둥근 모서리가 직선으로 늘어나 테두리가 깨진다) */
function schedule(card) {
  const { rows, x0, x1 } = card;
  const add = Math.round(GROW / rows.length);
  const map = [];
  rows.forEach(([a, b], i) => {
    const extra = i === rows.length - 1 ? GROW - add * (rows.length - 1) : add;

    // 이 행의 글자 위/아래 끝
    let top = -1;
    let bot = -1;
    for (let y = a + 2; y <= b - 2; y++) {
      let has = false;
      for (let x = x0 + 6; x <= x1 - 6; x++) if (isInk(x, y)) { has = true; break; }
      if (has) {
        if (top < 0) top = y;
        bot = y;
      }
    }
    const center = top < 0 ? (a + b) / 2 : (top + bot) / 2;

    const h = b - a + 1;
    // 넓어진 칸(h+extra)의 가운데에 글자 중심이 오도록 위쪽에 넣을 양
    const up = Math.max(0, Math.min(extra, Math.round((h + extra) / 2 - (center - a)) + BIAS));
    const blankTop = a + 4;
    const blankBot = Math.min(bot < 0 ? b - 16 : bot + 6, b - 16); // 모서리 곡선(아래 16px)은 피한다

    for (let y = a; y < blankTop; y++) map.push(y);
    for (let k = 0; k < up; k++) map.push(blankTop);
    for (let y = blankTop; y <= blankBot; y++) map.push(y);
    for (let k = 0; k < extra - up; k++) map.push(blankBot);
    for (let y = blankBot + 1; y <= b; y++) map.push(y);
  });
  return map;
}
const mapL = schedule(CARD.left);
const mapR = schedule(CARD.right);
if (mapL.length !== mapR.length) throw new Error(`두 카드 높이가 어긋남 ${mapL.length} / ${mapR.length}`);

const H2 = H + GROW;
const out = Buffer.alloc(W * H2 * CH);
const copyRow = (srcY, dstY, x0 = 0, x1 = W - 1) => {
  for (let x = x0; x <= x1; x++) for (let c = 0; c < CH; c++) out[(dstY * W + x) * CH + c] = data[at(x, srcY) + c];
};
for (let y = 0; y < TABLE[0]; y++) copyRow(y, y); // 표 위쪽 (제목 · 머리띠 · 열 이름)
for (let k = 0; k < mapL.length; k++) {
  const dst = TABLE[0] + k;
  copyRow(mapL[k], dst, 0, SPLIT_X - 1);
  copyRow(mapR[k], dst, SPLIT_X, W - 1);
}
for (let y = TABLE[1] + 1; y < H; y++) copyRow(y, y + GROW); // 아래쪽 안내 박스
console.log(`  3) 행 세로 간격 +${Math.round(GROW / CARD.left.rows.length)}px (카드당 +${GROW}px)`);

/* ---------- 4) 안내 문구 ---------- */
const note = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H2}">
  <text x="${NOTE_XY[0]}" y="${NOTE_XY[1]}" font-family="Apple SD Gothic Neo, AppleGothic, sans-serif"
        font-size="30" font-weight="700" fill="#EAF2F8">${NOTE}</text>
</svg>`;

await sharp(out, { raw: { width: W, height: H2, channels: CH } })
  .composite([{ input: Buffer.from(note), top: 0, left: 0 }])
  .webp({ quality: 92 })
  .toFile(OUT + ".tmp");
fs.renameSync(OUT + ".tmp", OUT);
console.log(`  4) 문구 얹기\n${OUT} ${W}x${H2}  ← app/page.tsx 의 <img height> 를 ${H2} 로`);
