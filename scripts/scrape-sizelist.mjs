#!/usr/bin/env node
/**
 * 타이어 사이즈 검색 결과(/product/tire/sizelist.aspx) 전수 스크래퍼 → data/sizelist/<code>.json
 *
 * 대상: lib/tireSizeOptions.ts 의 단면폭 18 × 편평비 10 × 인치 12 = 2160 가지 사이즈 코드
 *       (코드 = 숫자 이어붙임, 예 225/45R18 → "2254518")
 *
 * 각 사이즈마다 원본에 전체탭(seltireg=all) / 낮은가격순(sorttireop=2) / 전체브랜드(brandop=all) 로 POST 하고
 * lib/sizelistParser.ts 의 parseSizeListHtml (페이지와 동일한 파서) 로 카드를 뽑는다.
 *  - 페이지 크기는 20장. "총 : N 개" 가 20 을 넘으면 lpage 2, 3 … 을 모두 받아 합친다.
 *  - 1페이지 상단 "베스트 타이어" 주황 섹션 카드는 아래 목록의 isBest 카드와 같은 상품이 중복 출력된 것이므로
 *    저장하지 않는다 (lib/sizelist.ts 가 isBest 카드로 다시 만든다). total 은 목록 카드 수와 같다.
 *  - 결과가 1개 이상인 사이즈만 data/sizelist/<code>.json ({ size, total, tires }) 으로 즉시 저장
 *  - data/sizelist/index.json 에 { pageSize, counts: {code: total}, empty: [code…] } 기록 (사이즈마다 갱신)
 *  - 실패한 코드는 data/sizelist/failures.json 에 기록되고, 다음 실행 때 다시 시도한다
 *  - 카드 이미지(/prodimg/…) 는 public/ 아래 같은 경로로 내려받는다 (이미 있으면 건너뜀)
 *
 * 재실행(resume): index.json 에 이미 기록된 코드(결과 있음/없음 모두) 는 기본적으로 건너뛴다.
 *
 * 원본 서버 부하를 피하기 위해 동시 2요청, 요청 사이 100ms, 타임아웃 60s, 실패 시 3회 재시도(2s/5s/10s 후).
 *
 * 실행: node scripts/scrape-sizelist.mjs [옵션] [code …]
 *   code …            지정한 사이즈 코드만 (없으면 2160개 전부)
 *   --force           이미 기록된 코드도 다시 받는다
 *   --concurrency=N   동시 요청 수 (기본 2)
 * (Node 22 의 TypeScript 타입 제거 기능으로 ../lib/*.ts 를 직접 import 한다)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { parseSizeListHtml, buildPostBody } from "../lib/sizelistParser.ts";
import { WIDTHS, RATIOS, INCHES } from "../lib/tireSizeOptions.ts";

const ORIGIN = "http://tirekongjang.com";
const SIZELIST_URL = `${ORIGIN}/product/tire/sizelist.aspx`;
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT_DIR = path.join(ROOT, "data", "sizelist");
const INDEX = path.join(OUT_DIR, "index.json");
const FAILURES = path.join(OUT_DIR, "failures.json");
const PUBLIC = path.join(ROOT, "public");
const PAGE_SIZE = 20; // 원본 한 페이지 목록 카드 수
const UA = "Mozilla/5.0";
const TIMEOUT_MS = 60000;
const RETRY_DELAYS = [2000, 5000, 10000]; // 재시도 전 대기 (총 3회 재시도)
const REQUEST_GAP_MS = Math.max(0, Number(process.env.SCRAPE_GAP_MS) || 1000); // 요청 사이 간격 (기본 1초, SCRAPE_GAP_MS 로 변경)
const DEFAULT_CONCURRENCY = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 인자 파싱 (플래그 / 사이즈 코드) */
function parseArgs(argv) {
  const opt = { force: false, concurrency: DEFAULT_CONCURRENCY, codes: [] };
  for (const a of argv) {
    if (a === "--force") opt.force = true;
    else if (a.startsWith("--concurrency=")) opt.concurrency = Math.max(1, parseInt(a.slice(14), 10) || DEFAULT_CONCURRENCY);
    else if (/^\d{7}$/.test(a)) opt.codes.push(a);
    else console.warn(`무시된 인자: ${a}`);
  }
  return opt;
}

/** 2160개 사이즈 코드 (단면폭 → 편평비 → 인치 순) */
function allCodes() {
  const codes = [];
  for (const w of WIDTHS) for (const r of RATIOS) for (const i of INCHES) codes.push(`${w}${r}${i}`);
  return codes;
}

/** fetch 1회 + 재시도(2s/5s/10s 백오프). fn 은 Response 를 검증해 값을 돌려준다 */
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

/** 원본 sizelist.aspx POST 1회 (타임아웃 60s, 재시도 3회) */
async function postSizeList(code, lpage) {
  const body = buildPostBody({ ftsize: code, rtsize: code, seltireg: "all", sorttireop: "2", brandop: [], spage: 1, lpage }).toString();
  return withRetry(`${code} p${lpage}`, async () => {
    const res = await fetch(SIZELIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes("총 :")) throw new Error("예상과 다른 HTML (총 : 없음)");
    await sleep(REQUEST_GAP_MS);
    return html;
  });
}

/** 사이즈 1개: 모든 페이지를 받아 목록 카드(베스트 섹션 중복 제외) 를 합친다 */
async function scrapeSize(code) {
  const first = parseSizeListHtml(await postSizeList(code, 1));
  const total = first.total;
  const tires = first.tires.filter((t) => !t.bestSection);
  const pages = Math.ceil(total / PAGE_SIZE);
  for (let p = 2; p <= pages; p++) {
    const r = parseSizeListHtml(await postSizeList(code, p));
    tires.push(...r.tires.filter((t) => !t.bestSection));
  }
  if (tires.length !== total) {
    console.warn(`  ${code}: 총 ${total}개인데 카드 ${tires.length}개 수집 (페이지 구조 확인 필요)`);
  }
  return { size: code, total, tires };
}

/** 이미지 다운로드 (이미 있으면 건너뜀, 재시도 3회). 반환: 새로 받았으면 true */
async function download(localPath) {
  if (!localPath || /^https?:\/\//.test(localPath)) return false;
  const dest = path.join(PUBLIC, localPath);
  try {
    if ((await fs.stat(dest)).size > 0) return false;
  } catch {}
  try {
    const buf = await withRetry(`img ${localPath}`, async () => {
      const res = await fetch(ORIGIN + localPath, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });
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
    console.warn(`  이미지 실패 ${localPath}: ${e.message}`);
    return false;
  }
}

/** JSON 파일 읽기 (없으면 fallback) */
async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

/** index.json 읽기 (없으면 빈 구조) */
async function loadIndex() {
  const j = await readJson(INDEX, {});
  return { counts: j.counts ?? {}, empty: j.empty ?? [] };
}

/** index.json 저장 (코드 오름차순 정렬). 사이즈 하나 끝날 때마다 호출되므로 중단돼도 진행 상태가 남는다 */
let saving = Promise.resolve();
function saveIndex(idx) {
  saving = saving.then(async () => {
    const counts = Object.fromEntries(Object.keys(idx.counts).sort().map((k) => [k, idx.counts[k]]));
    const empty = [...new Set(idx.empty)].sort();
    const out = { pageSize: PAGE_SIZE, generatedAt: new Date().toISOString(), sizes: Object.keys(counts).length, counts, empty };
    await fs.writeFile(INDEX, JSON.stringify(out, null, 2) + "\n");
  });
  return saving;
}

/** failures.json 저장 ({ codes: [...] }) — 비어 있으면 파일 삭제 */
async function saveFailures(codes) {
  const list = [...new Set(codes)].sort();
  if (list.length === 0) {
    await fs.rm(FAILURES, { force: true });
    return;
  }
  await fs.writeFile(FAILURES, JSON.stringify({ updatedAt: new Date().toISOString(), codes: list }, null, 2) + "\n");
}

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  await fs.mkdir(OUT_DIR, { recursive: true });
  const idx = await loadIndex();
  const prevFailed = new Set((await readJson(FAILURES, {})).codes ?? []);

  /* 대상: 인자 코드 또는 전체. 기본은 resume (index 에 있는 코드는 건너뜀, 이전 실패분은 다시 시도) */
  let codes = opt.codes.length ? opt.codes : allCodes();
  if (!opt.force) {
    const done = new Set([...Object.keys(idx.counts), ...idx.empty]);
    codes = codes.filter((c) => !done.has(c) || prevFailed.has(c));
  }
  console.log(`대상 ${codes.length}개 사이즈 (이전 실패 ${prevFailed.size}개 포함), 동시 ${opt.concurrency}`);

  const queue = [...codes];
  const failed = new Set();
  const imageSet = new Set(); // 내려받을 이미지 경로 (중복 제거)
  let done = 0;
  let tireCount = 0;
  const t0 = Date.now();

  await Promise.all(
    Array.from({ length: opt.concurrency }, async () => {
      while (queue.length) {
        const code = queue.shift();
        try {
          const r = await scrapeSize(code);
          if (r.total > 0) {
            await fs.writeFile(path.join(OUT_DIR, `${code}.json`), JSON.stringify(r, null, 2) + "\n");
            idx.counts[code] = r.total;
            idx.empty = idx.empty.filter((c) => c !== code);
            tireCount += r.tires.length;
            for (const t of r.tires) imageSet.add(t.imageUrl);
          } else {
            delete idx.counts[code];
            if (!idx.empty.includes(code)) idx.empty.push(code);
            await fs.rm(path.join(OUT_DIR, `${code}.json`), { force: true });
          }
          prevFailed.delete(code);
          done++;
          const el = ((Date.now() - t0) / 1000).toFixed(0);
          if (r.total > 0 || done % 50 === 0) console.log(`[${done}/${codes.length}] ${code}: ${r.total}개 (${el}s)`);
          await saveIndex(idx);
          await saveFailures([...prevFailed, ...failed]);
        } catch (e) {
          failed.add(code);
          console.warn(`  ${code}: 실패 — ${e.message}`);
          await saveFailures([...prevFailed, ...failed]);
        }
      }
    }),
  );
  await saveIndex(idx);
  await saveFailures([...prevFailed, ...failed]);

  /* 이미지 다운로드 (있는 것은 건너뜀) — 이번에 받은 사이즈뿐 아니라 저장된 모든 사이즈 파일의 이미지를 확인 */
  for (const f of await fs.readdir(OUT_DIR)) {
    if (!/^\d{7}\.json$/.test(f)) continue;
    const j = await readJson(path.join(OUT_DIR, f), { tires: [] });
    for (const t of j.tires ?? []) imageSet.add(t.imageUrl);
  }
  const images = [...imageSet].filter(Boolean);
  console.log(`이미지 ${images.length}개 확인/다운로드`);
  let fetched = 0;
  const iq = [...images];
  await Promise.all(
    Array.from({ length: opt.concurrency }, async () => {
      while (iq.length) {
        if (await download(iq.shift())) fetched++;
      }
    }),
  );

  const sizes = Object.keys(idx.counts).length;
  const totalTires = Object.values(idx.counts).reduce((a, b) => a + b, 0);
  const remaining = [...prevFailed, ...failed];
  console.log(
    `완료: 결과 있는 사이즈 ${sizes}개 / 없는 사이즈 ${idx.empty.length}개 (이번 실행 카드 ${tireCount}개, 전체 카드 ${totalTires}개), 새 이미지 ${fetched}개, 실패 ${remaining.length}개${remaining.length ? ": " + remaining.join(",") : ""}`,
  );
  if (remaining.length) console.log("실패분은 data/sizelist/failures.json 에 기록됨 — 같은 명령을 다시 실행하면 재시도한다");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
