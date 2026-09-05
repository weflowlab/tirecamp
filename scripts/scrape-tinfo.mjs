#!/usr/bin/env node
/**
 * 타이어 상세 팝업(/product/tinfo/view.aspx?tinfoseq=N) 스크래퍼 → data/tinfo.json
 *
 * 대상 seq
 *  - data/tprodintro.json 의 모든 seq
 *  - 인자로 넘긴 디렉터리의 *.html 안에 있는 tireinfowin('N') 전부 (예: 원본 저장본 폴더)
 *  - 인자로 직접 넘긴 숫자
 *
 * 각 seq 마다 원본 HTML 을 받아 lib/tinfo.ts 의 parseTinfoHtml 로 파싱하고
 *  - 상품 이미지(/prodimg/...) 를 public/ 아래 같은 경로로
 *  - 하단 상세 내용의 외부 이미지(otire.co.kr 등) 를 public/ext/<host>/<path> 로
 * 내려받은 뒤 { [seq]: Tinfo } 형태로 저장한다.
 *
 * 실행: node scripts/scrape-tinfo.mjs [html-dir|seq ...]
 * (Node 22 의 TypeScript 타입 제거 기능으로 ../lib/tinfo.ts 를 직접 import 한다)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { ORIGIN, parseTinfoHtml, localizeContentImages, fetchTinfoHtml } from "../lib/tinfo.ts";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const LIST = path.join(ROOT, "data", "tprodintro.json");
const OUT = path.join(ROOT, "data", "tinfo.json");
const PUBLIC = path.join(ROOT, "public");
const CONCURRENCY = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 대상 seq 수집 */
async function collectSeqs(args) {
  const seqs = new Set();
  try {
    const list = JSON.parse(await fs.readFile(LIST, "utf8"));
    for (const it of list.items) seqs.add(String(it.seq));
  } catch {
    console.warn("data/tprodintro.json 없음 — 먼저 scrape-tprodintro.mjs 를 실행하세요");
  }
  for (const a of args) {
    if (/^\d+$/.test(a)) {
      seqs.add(a);
      continue;
    }
    const st = await fs.stat(a).catch(() => null);
    if (!st?.isDirectory()) continue;
    for (const f of await fs.readdir(a)) {
      if (!f.endsWith(".html")) continue;
      const html = await fs.readFile(path.join(a, f), "utf8").catch(() => "");
      for (const m of html.matchAll(/tireinfowin\('(\d+)'\)/g)) seqs.add(m[1]);
    }
  }
  return [...seqs].sort((a, b) => Number(a) - Number(b));
}

/** 이미지 다운로드 (이미 있으면 건너뜀) */
async function download(url, localPath) {
  const dest = path.join(PUBLIC, localPath);
  try {
    if ((await fs.stat(dest)).size > 0) return false;
  } catch {}
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.warn(`  이미지 실패 ${url}: HTTP ${res.status}`);
    return false;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function scrapeOne(seq) {
  const html = await fetchTinfoHtml(seq);
  const { tinfo, downloads } = localizeContentImages(parseTinfoHtml(html, seq));
  if (tinfo.image) await download(ORIGIN + tinfo.image, tinfo.image);
  for (const d of downloads) await download(d.url, d.local);
  return tinfo;
}

async function main() {
  const seqs = await collectSeqs(process.argv.slice(2));
  console.log(`대상 ${seqs.length}개`);

  // 기존 결과가 있으면 위에 덮어씀 (재실행 시 누락분만 갱신 가능)
  let result = {};
  try {
    result = JSON.parse(await fs.readFile(OUT, "utf8"));
  } catch {}

  const queue = [...seqs];
  const failed = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const seq = queue.shift();
        try {
          const t = await scrapeOne(seq);
          result[seq] = t;
          console.log(`  ${seq}: ${t.brandName} ${t.model} (점수 ${t.scores.length}개)`);
        } catch (e) {
          failed.push(seq);
          console.warn(`  ${seq}: 실패 — ${e.message}`);
        }
        await sleep(200);
      }
    }),
  );

  const ordered = Object.fromEntries(Object.keys(result).sort((a, b) => Number(a) - Number(b)).map((k) => [k, result[k]]));
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(ordered, null, 2) + "\n");
  console.log(`저장: ${OUT} (${Object.keys(ordered).length}개, 실패 ${failed.length}개${failed.length ? ": " + failed.join(",") : ""})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
