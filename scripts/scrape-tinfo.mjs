#!/usr/bin/env node
/**
 * 타이어 상세 팝업(/product/tinfo/view.aspx?tinfoseq=N) 스크래퍼 → data/tinfo.json
 *
 * 대상 seq
 *  - data/tprodintro.json 의 모든 seq
 *  - data/sizelist/*.json (scrape-sizelist.mjs 결과) 카드에 등장하는 모든 tinfoseq
 *  - 인자로 넘긴 디렉터리의 *.html 안에 있는 tireinfowin('N') 전부 (예: 원본 저장본 폴더)
 *  - 인자로 직접 넘긴 숫자
 *
 * 각 seq 마다 원본 HTML 을 받아 lib/tinfo.ts 의 parseTinfoHtml 로 파싱하고
 *  - 상품 이미지(/prodimg/...) 를 public/ 아래 같은 경로로
 *  - 하단 상세 내용의 외부 이미지(otire.co.kr 등) 를 public/ext/<host>/<path> 로
 * 내려받은 뒤 { [seq]: Tinfo } 형태로 저장한다 (seq 하나 끝날 때마다 즉시 저장 → 중단돼도 진행 상태가 남는다).
 *
 * 재실행(resume): data/tinfo.json 에 이미 있는 seq 는 기본적으로 건너뛴다 (--force 면 다시 받음).
 * 실패한 seq 는 data/tinfo-failures.json 에 기록되고 다음 실행 때 다시 시도한다.
 *
 * 원본 서버 부하를 피하기 위해 동시 2요청, 요청 사이 100ms, 타임아웃 60s, 실패 시 3회 재시도(2s/5s/10s 후).
 *
 * 실행: node scripts/scrape-tinfo.mjs [--force] [html-dir|seq ...]
 * (Node 22 의 TypeScript 타입 제거 기능으로 ../lib/tinfo.ts 를 직접 import 한다)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { parseTinfoHtml, localizeContentImages } from "../lib/tinfo.ts";

/** 원본 서버 주소 (팝업 HTML 및 이미지 다운로드 기준) — 앱 코드에는 두지 않고 스크립트에만 둔다 */
const ORIGIN = "http://tirekongjang.com";
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const LIST = path.join(ROOT, "data", "tprodintro.json");
const SIZELIST_DIR = path.join(ROOT, "data", "sizelist");
const OUT = path.join(ROOT, "data", "tinfo.json");
const FAILURES = path.join(ROOT, "data", "tinfo-failures.json");
const PUBLIC = path.join(ROOT, "public");
const CONCURRENCY = 1;
const UA = "Mozilla/5.0";
const TIMEOUT_MS = 60000;
const RETRY_DELAYS = [2000, 5000, 10000]; // 재시도 전 대기 (총 3회 재시도)
const REQUEST_GAP_MS = Math.max(0, Number(process.env.SCRAPE_GAP_MS) || 1000); // 요청 사이 간격 (기본 1초, SCRAPE_GAP_MS 로 변경)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** JSON 파일 읽기 (없으면 fallback) */
async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

/** fetch 1회 + 재시도(2s/5s/10s 백오프) */
async function withRetry(label, fn) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt < RETRY_DELAYS.length) {
        console.warn(`  ${label}: ${e.message} — ${RETRY_DELAYS[attempt] / 1000}s 후 재시도 (${attempt + 1}/${RETRY_DELAYS.length})`);
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }
  throw lastErr;
}

/** 원본 서버에서 팝업 HTML 을 가져온다 (UTF-8 응답) */
function fetchTinfoHtml(seq) {
  return withRetry(`tinfo ${seq}`, async () => {
    const res = await fetch(`${ORIGIN}/product/tinfo/view.aspx?tinfoseq=${encodeURIComponent(String(seq))}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    await sleep(REQUEST_GAP_MS);
    return html;
  });
}

/** 대상 seq 수집 */
async function collectSeqs(args) {
  const seqs = new Set();
  const list = await readJson(LIST, null);
  if (list) for (const it of list.items) seqs.add(String(it.seq));
  else console.warn("data/tprodintro.json 없음 — 먼저 scrape-tprodintro.mjs 를 실행하세요");

  /* 사이즈 검색 결과에 등장하는 모든 tinfoseq */
  try {
    for (const f of await fs.readdir(SIZELIST_DIR)) {
      if (!/^\d{7}\.json$/.test(f)) continue;
      const j = await readJson(path.join(SIZELIST_DIR, f), { tires: [] });
      for (const t of j.tires ?? []) if (t.tinfoseq) seqs.add(String(t.tinfoseq));
    }
  } catch {
    console.warn("data/sizelist/ 없음 — scrape-sizelist.mjs 를 먼저 실행하면 사이즈 결과의 seq 도 포함된다");
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

/** 이미지 다운로드 (이미 있으면 건너뜀, 재시도 3회) */
async function download(url, localPath) {
  const dest = path.join(PUBLIC, localPath);
  try {
    if ((await fs.stat(dest)).size > 0) return false;
  } catch {}
  try {
    const buf = await withRetry(`img ${localPath}`, async () => {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const b = Buffer.from(await res.arrayBuffer());
      if (b.length === 0) throw new Error("빈 응답");
      await sleep(REQUEST_GAP_MS);
      return b;
    });
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buf);
    return true;
  } catch (e) {
    console.warn(`  이미지 실패 ${url}: ${e.message}`);
    return false;
  }
}

/** seq 1개: HTML → Tinfo + 이미지 다운로드 */
async function scrapeOne(seq) {
  const html = await fetchTinfoHtml(seq);
  const { tinfo, downloads } = localizeContentImages(parseTinfoHtml(html, seq));
  if (!tinfo.model) throw new Error("모델명 없음 (존재하지 않는 seq 이거나 HTML 형식 변경)");
  if (tinfo.image) await download(ORIGIN + tinfo.image, tinfo.image);
  for (const d of downloads) await download(d.url, d.local);
  return tinfo;
}

/** 결과 저장 (seq 오름차순). 순차 큐로 동시 저장 충돌 방지 */
let saving = Promise.resolve();
function saveResult(result) {
  saving = saving.then(async () => {
    const ordered = Object.fromEntries(Object.keys(result).sort((a, b) => Number(a) - Number(b)).map((k) => [k, result[k]]));
    await fs.mkdir(path.dirname(OUT), { recursive: true });
    await fs.writeFile(OUT, JSON.stringify(ordered, null, 2) + "\n");
  });
  return saving;
}

/** 실패 목록 저장 — 비어 있으면 파일 삭제 */
async function saveFailures(seqs) {
  const list = [...new Set(seqs)].sort((a, b) => Number(a) - Number(b));
  if (list.length === 0) {
    await fs.rm(FAILURES, { force: true });
    return;
  }
  await fs.writeFile(FAILURES, JSON.stringify({ updatedAt: new Date().toISOString(), seqs: list }, null, 2) + "\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const result = await readJson(OUT, {});
  const prevFailed = new Set((await readJson(FAILURES, {})).seqs ?? []);

  let seqs = await collectSeqs(argv.filter((a) => a !== "--force"));
  const all = seqs.length;
  if (!force) seqs = seqs.filter((s) => !result[s] || prevFailed.has(s)); // 이미 있는 seq 는 건너뜀, 이전 실패분은 재시도
  console.log(`대상 ${seqs.length}개 (전체 ${all}개, 기존 ${Object.keys(result).length}개, 이전 실패 ${prevFailed.size}개), 동시 ${CONCURRENCY}`);

  const queue = [...seqs];
  const failed = new Set();
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const seq = queue.shift();
        try {
          const t = await scrapeOne(seq);
          result[seq] = t;
          prevFailed.delete(seq);
          done++;
          console.log(`  [${done}/${seqs.length}] ${seq}: ${t.brandName} ${t.model} (점수 ${t.scores.length}개)`);
          await saveResult(result);
        } catch (e) {
          failed.add(seq);
          console.warn(`  ${seq}: 실패 — ${e.message}`);
        }
        await saveFailures([...prevFailed, ...failed]);
      }
    }),
  );

  await saveResult(result);
  const remaining = [...prevFailed, ...failed];
  await saveFailures(remaining);
  console.log(`저장: ${OUT} (${Object.keys(result).length}개, 실패 ${remaining.length}개${remaining.length ? ": " + remaining.join(",") : ""})`);
  if (remaining.length) console.log("실패분은 data/tinfo-failures.json 에 기록됨 — 같은 명령을 다시 실행하면 재시도한다");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
