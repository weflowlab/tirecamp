#!/usr/bin/env node
/**
 * 타이어소개(/product/tprodintro/) 목록 스크래퍼 → data/tprodintro.json
 *
 * 원본은 form(frm) POST 로 페이지/필터를 처리한다:
 *   spage, lpage(페이지 번호), findfristchk, htypecode(타입), hlevelcode(등급), brandop(브랜드 체크박스)
 *
 * 절차
 *  1. 필터 없이 1..N 페이지를 모두 받아 카드(seq, 이미지, 브랜드 로고 코드, "타입 | 등급", 가격대)를 원본 순서대로 수집
 *  2. 타입(10/15/20), 등급(10/15/20/25/30) 필터 결과 페이지를 받아 각 seq 에 typeCode/levelCode 를 부여
 *     (필터 링크에 없는 라벨 — 승용/SUV, 사계절용, 전기차 등 — 은 코드 null → 원본처럼 '전체'에서만 노출)
 *  3. 카드 이미지가 public/ 에 없으면 내려받는다
 *
 * 실행: node scripts/scrape-tprodintro.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ORIGIN = "http://tirekongjang.com";
const LIST_URL = `${ORIGIN}/product/tprodintro/`;
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT = path.join(ROOT, "data", "tprodintro.json");
const PUBLIC = path.join(ROOT, "public");

/** 브랜드 코드 → 이름 (원본 brandop 체크박스) */
const BRANDS = {
  10: "한국타이어", 14: "금호타이어", 16: "넥센타이어", 20: "미쉐린", 22: "피렐리",
  23: "콘티넨탈", 21: "브리지스톤", 28: "던롭", 24: "요코하마", 26: "굳이어",
};
const TYPE_CODES = ["10", "15", "20"];
const LEVEL_CODES = ["10", "15", "20", "25", "30"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 원본 frm POST 한 번 */
async function postList({ lpage = 1, type = "", level = "", brands = ["all"] } = {}) {
  const body = new URLSearchParams();
  body.set("spage", "1");
  body.set("lpage", String(lpage));
  body.set("findfristchk", "");
  body.set("htypecode", type);
  body.set("hlevelcode", level);
  for (const b of brands) body.append("brandop", b);
  const res = await fetch(LIST_URL, {
    method: "POST",
    headers: { "User-Agent": "Mozilla/5.0", "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`list HTTP ${res.status}`);
  return res.text();
}

/** 카드 마크업 파싱 (원본 순서 유지) */
function parseCards(html) {
  const re =
    /tireinfowin\('(\d+)'\)">\s*<img border="0" src="([^"]+)">[\s\S]*?companylogo\/(\d+)\.gif[\s\S]*?<font face="돋움">([^<|]*?)\s*\|\s*([^<]*?)<\/font>[\s\S]*?<font face="Arial">([^<]*)<\/font><\/b>원/g;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      seq: m[1],
      image: m[2],
      brandCode: m[3],
      brandName: BRANDS[m[3]] ?? "",
      typeLabel: m[4].replace(/\s+/g, " ").trim(),
      levelLabel: m[5].replace(/\s+/g, " ").trim(),
      price: m[6].trim(),
    });
  }
  return out;
}

/** "페이지 : 1/3" → 3 */
function totalPages(html) {
  const m = html.match(/페이지 : \d+\/(\d+)/);
  return m ? Number(m[1]) : 1;
}

/** 필터 조건으로 전 페이지의 seq 집합을 모은다 */
async function collectSeqs(opts) {
  const first = await postList({ ...opts, lpage: 1 });
  const pages = totalPages(first);
  const seqs = new Set(parseCards(first).map((c) => c.seq));
  for (let p = 2; p <= pages; p++) {
    await sleep(300);
    for (const c of parseCards(await postList({ ...opts, lpage: p }))) seqs.add(c.seq);
  }
  return seqs;
}

async function download(urlPath) {
  const dest = path.join(PUBLIC, urlPath);
  try {
    const st = await fs.stat(dest);
    if (st.size > 0) return false;
  } catch {}
  const res = await fetch(ORIGIN + urlPath, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`img ${urlPath}: HTTP ${res.status}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function main() {
  // 1. 전체 목록
  const first = await postList();
  const pages = totalPages(first);
  const total = Number((first.match(/상품수 : (\d+)개/) || [])[1] ?? 0);
  let items = parseCards(first);
  for (let p = 2; p <= pages; p++) {
    await sleep(300);
    items = items.concat(parseCards(await postList({ lpage: p })));
  }
  console.log(`목록: ${items.length}개 (원본 표기 ${total}개, ${pages}페이지)`);

  // 2. 타입/등급 코드 태깅
  const typeMap = new Map();
  for (const code of TYPE_CODES) {
    await sleep(300);
    const seqs = await collectSeqs({ type: code });
    for (const s of seqs) typeMap.set(s, code);
    console.log(`타입 ${code}: ${seqs.size}개`);
  }
  const levelMap = new Map();
  for (const code of LEVEL_CODES) {
    await sleep(300);
    const seqs = await collectSeqs({ level: code });
    for (const s of seqs) levelMap.set(s, code);
    console.log(`등급 ${code}: ${seqs.size}개`);
  }
  items = items.map((it) => ({
    ...it,
    typeCode: typeMap.get(it.seq) ?? null,
    levelCode: levelMap.get(it.seq) ?? null,
  }));

  // 3. 카드 이미지
  let dl = 0;
  for (const it of items) {
    if (await download(it.image)) dl++;
  }
  console.log(`이미지 새로 받음: ${dl}개`);

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify({ total: items.length, perPage: 32, items }, null, 2) + "\n");
  console.log(`저장: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
