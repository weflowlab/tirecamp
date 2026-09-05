#!/usr/bin/env node
/**
 * 차량검색(제조사 → 연식 → 차종 → 타이어사이즈 + 차량사진) 전체 스크래퍼
 *
 * 원본(tirekongjang.com)의 AJAX 모듈 3종을 모두 순회해 정적 JSON 으로 저장한다.
 *   /common/ajaxmodule/getcaryear.aspx?makercode=..                       → 연식 목록
 *   /common/ajaxmodule/getcarname.aspx?makercode=..&syear=..              → 차종 목록
 *   /common/ajaxmodule/getcartsizelist.aspx?makercode=..&syear=..&carcode=..&imgtype=0 → 사이즈 + 사진
 *
 * 산출물
 *   data/carfind/makers.json          { "<maker>": { years: [...], cars: { "<year>": [{code,name}] } } }
 *   data/carfind/sizes/<maker>.json   { "<year>-<car>": { carimg: "/siteimg/..." | null, sizes: [...] } }
 *   data/carfind/failures.json        마지막 실행에서 실패한 요청 목록 (재실행하면 빠진 항목만 다시 받는다)
 *   public/siteimg/...                 차량 사진 (원본과 같은 경로, 이미 있으면 건너뜀)
 *
 * 실행: node scripts/scrape-carfind.mjs            (전체 / 이어받기)
 *       node scripts/scrape-carfind.mjs --fresh    (기존 산출물 무시하고 처음부터)
 *
 * 원본 서버가 약해서 매우 보수적으로 요청한다:
 *   - 동시 요청 2개(CARFIND_CONCURRENCY 로 변경), 요청 간 100ms 지연, 요청당 타임아웃 60초
 *   - 실패 시 2s → 5s → 10s 간격으로 최대 3회 재시도
 *   - 체크포인트: 제조사별로 연식+차종을 받자마자 makers.json 저장, 사이즈는 제조사 파일 단위로 저장(200건마다 중간 저장)
 *   - 재실행 시 디스크에 이미 있는 제조사/연식/차종 데이터는 건너뛰고 빠진 것만 요청한다
 *   - 제조사 목록은 lib/tireSizeOptions.ts 의 MAKERS 와 동일하게 아래 MAKER_CODES 에 고정
 */
import fs from "node:fs/promises";
import path from "node:path";

const ORIGIN = "http://tirekongjang.com";
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT_DIR = path.join(ROOT, "data", "carfind");
const SIZES_DIR = path.join(OUT_DIR, "sizes");
const MAKERS_FILE = path.join(OUT_DIR, "makers.json");
const FAILURES_FILE = path.join(OUT_DIR, "failures.json");
const PUBLIC = path.join(ROOT, "public");
const UA = "Mozilla/5.0";

/* 요청 정책 */
const CONCURRENCY = Math.max(1, Number(process.env.CARFIND_CONCURRENCY) || 2); // 동시 요청 수
const REQUEST_TIMEOUT_MS = 60_000; // 요청당 타임아웃
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000]; // 재시도 간격 (총 3회)
const REQUEST_GAP_MS = Math.max(0, Number(process.env.SCRAPE_GAP_MS) || 1000); // 요청 사이 간격 (기본 1초, SCRAPE_GAP_MS 로 변경)
const CHECKPOINT_EVERY = 200; // 사이즈 수집 중간 저장 주기

/* 제조사 코드 (lib/tireSizeOptions.ts MAKERS 와 동일) */
const MAKER_CODES = [
  "10", "15", "17", "20", "25", "30", "40", "45", "50", "55", "56", "57", "58", "59", "60",
  "61", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "75", "76", "77",
  "80", "85", "86", "87", "88", "89", "90", "91", "92", "95", "97", "98", "99",
];

/* --fresh: 기존 산출물을 무시하고 전부 다시 받는다 */
const FRESH = process.argv.includes("--fresh");

/* 실패 기록 (failures.json 으로 저장 + 마지막에 요약 출력) */
const failures = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ───────────────────────── 공통 유틸 ───────────────────────── */

/** 기존 JSON 산출물 읽기 (없거나 --fresh 면 null) */
async function readExisting(file) {
  if (FRESH) return null;
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

/** JSON 저장 (임시 파일에 쓴 뒤 rename → 중간에 죽어도 파일이 깨지지 않음) */
async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data), "utf8");
  await fs.rename(tmp, file);
}

/** 실패 목록을 failures.json 에 기록 */
async function saveFailures() {
  await writeJson(FAILURES_FILE, { at: new Date().toISOString(), count: failures.length, items: failures });
}

/** 실패 추가 + 즉시 기록 */
async function recordFailure(kind, key, err) {
  failures.push({ kind, key, error: String(err?.message ?? err) });
  await saveFailures();
}

/** 원본 XML 을 문자열로 가져온다 (1회). encoding 선언(euc-kr/ks_c_5601)에 맞춰 디코딩 */
async function fetchXmlOnce(p) {
  const res = await fetch(ORIGIN + p, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const head = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 120));
  const enc = /encoding=["']([^"']+)["']/i.exec(head)?.[1]?.toLowerCase() ?? "utf-8";
  const label = enc.includes("5601") || enc.includes("euc-kr") ? "euc-kr" : "utf-8";
  try {
    return new TextDecoder(label).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

/** 재시도(2s/5s/10s) + 요청 간 지연을 적용한 XML fetch */
async function fetchXml(p) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);
    try {
      const xml = await fetchXmlOnce(p);
      await sleep(REQUEST_GAP_MS);
      return xml;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`${p}: ${lastErr?.message ?? lastErr}`);
}

/** XML 엔티티 복원 */
function unescapeXml(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** <tag attr="v" .../> 의 속성 목록을 객체로 */
function parseAttrs(attrText) {
  const out = {};
  const re = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(attrText))) out[m[1]] = unescapeXml(m[2] ?? m[3] ?? "");
  return out;
}

/** 작업 배열을 동시 N개로 실행. onDone 으로 진행률 출력 */
async function runPool(tasks, concurrency, onDone) {
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      await tasks[i]();
      done++;
      if (onDone) onDone(done, tasks.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
}

/** 진행률 출력 */
function progress(label, done, total) {
  if (done % 25 === 0 || done === total) console.log(`${label} ${done}/${total}`);
}

/* ───────────────────────── 파서 ───────────────────────── */

/** <years><year>2026</year>… → ["2026", …] */
function parseYears(xml) {
  return [...xml.matchAll(/<year>\s*([^<]+?)\s*<\/year>/g)].map((m) => m[1]);
}

/** <cars><car code="133" name="그랜저"/>… → [{code,name}] */
function parseCars(xml) {
  return [...xml.matchAll(/<car\b([^>]*?)\/?>/g)]
    .map((m) => parseAttrs(m[1]))
    .filter((a) => a.code && a.name)
    .map((a) => ({ code: a.code, name: a.name }));
}

/** <tirelist><tlist …/>…<carimg>/siteimg/…</carimg></tirelist> → { carimg, sizes } */
function parseSizeList(xml) {
  const sizes = [...xml.matchAll(/<tlist\b([^>]*?)\/?>/g)].map((m) => {
    const a = parseAttrs(m[1]);
    return {
      frtype: a.frtype ?? "1",
      oesize: a.oesize ?? "",
      ftsize: a.ftsize ?? "",
      rtsize: a.rtsize ?? "",
      ftsizev: a.ftsizev ?? "",
      rtsizev: a.rtsizev ?? "",
    };
  });
  const imgMatch = /<carimg\b[^>]*>\s*([^<]+?)\s*<\/carimg>/.exec(xml);
  let carimg = null;
  if (imgMatch) {
    let raw = unescapeXml(imgMatch[1]).trim();
    // 절대 URL 이면 경로만 남긴다 (로컬 public/ 경로로 쓰기 위해)
    raw = raw.replace(/^https?:\/\/[^/]+/i, "");
    if (raw) carimg = raw.startsWith("/") ? raw : "/" + raw;
  }
  return { carimg, sizes };
}

/* ───────────────────────── 1단계: 연식 + 차종 (제조사별 체크포인트) ───────────────────────── */

/**
 * 모든 제조사의 연식 목록과 연식별 차종 목록을 수집 → makers 객체
 * - 제조사 하나가 끝날 때마다 makers.json 저장
 * - 기존 makers.json 의 값은 재사용: 연식이 비어 있으면 다시 요청, 차종은 키가 없는 연식만 요청
 *   (차종이 0개인 연식도 정상이므로 "키 존재 여부"로 완료를 판단한다)
 */
async function scrapeMakers() {
  const makers = (await readExisting(MAKERS_FILE)) ?? {};
  for (const mk of MAKER_CODES) makers[mk] ??= { years: [], cars: {} };

  console.log(`[1/3] 연식 + 차종 목록 수집 (${MAKER_CODES.length} 제조사, 동시 ${CONCURRENCY})`);
  for (const mk of MAKER_CODES) {
    const info = makers[mk];

    // 연식 (없을 때만)
    if (info.years.length === 0) {
      try {
        info.years = parseYears(await fetchXml(`/common/ajaxmodule/getcaryear.aspx?makercode=${mk}`));
      } catch (e) {
        await recordFailure("years", mk, e);
      }
    }

    // 차종: 아직 키가 없는 연식만
    const needYears = info.years.filter((y) => !(y in info.cars));
    await runPool(
      needYears.map((y) => async () => {
        try {
          info.cars[y] = parseCars(await fetchXml(`/common/ajaxmodule/getcarname.aspx?makercode=${mk}&syear=${y}`));
        } catch (e) {
          await recordFailure("names", `${mk}/${y}`, e); // 키를 남기지 않아 다음 실행 때 다시 요청
        }
      }),
      CONCURRENCY,
    );

    // 제조사 단위 체크포인트
    await writeJson(MAKERS_FILE, makers);
    const carCount = Object.values(info.cars).reduce((n, a) => n + a.length, 0);
    console.log(`  제조사 ${mk}: 연식 ${info.years.length}, 차종 ${carCount} (새로 받은 연식 ${needYears.length})`);
  }
  return makers;
}

/* ───────────────────────── 2단계: 사이즈 + 사진 경로 ───────────────────────── */

/**
 * 제조사 하나의 모든 (연식, 차종) 조합 사이즈 목록 수집 → { "<year>-<car>": {carimg, sizes} }
 * 기존 sizes/<maker>.json 이 있으면 이미 있는 키는 건너뛰고, CHECKPOINT_EVERY 건마다 중간 저장한다.
 */
async function scrapeSizesForMaker(mk, info, counter) {
  const file = path.join(SIZES_DIR, `${mk}.json`);
  const out = (await readExisting(file)) ?? {};
  const triples = [];
  for (const [y, cars] of Object.entries(info.cars))
    for (const c of cars) if (!(`${y}-${c.code}` in out)) triples.push([y, c.code]);
  counter.done += Object.keys(out).length; // 이미 받아둔 만큼 진행률 반영

  let sinceSave = 0;
  await runPool(
    triples.map(([y, c]) => async () => {
      try {
        const xml = await fetchXml(
          `/common/ajaxmodule/getcartsizelist.aspx?makercode=${mk}&syear=${y}&carcode=${c}&imgtype=0`,
        );
        out[`${y}-${c}`] = parseSizeList(xml);
        if (++sinceSave >= CHECKPOINT_EVERY) {
          sinceSave = 0;
          await writeJson(file, out);
        }
      } catch (e) {
        await recordFailure("sizes", `${mk}/${y}/${c}`, e); // 키를 남기지 않아 다음 실행 때 다시 요청
      }
      counter.done++;
      progress("  사이즈", counter.done, counter.total);
    }),
    CONCURRENCY,
  );
  await writeJson(file, out); // 제조사 완료 시 저장
  return out;
}

/* ───────────────────────── 3단계: 이미지 다운로드 ───────────────────────── */

/** 원본 경로의 이미지를 public/ 아래 같은 경로로 저장. 이미 있고 비어있지 않으면 건너뜀. 반환: "saved" | "skipped" | "failed" */
async function downloadImage(rel) {
  const dest = path.join(PUBLIC, rel);
  try {
    const st = await fs.stat(dest);
    if (st.size > 0) return "skipped";
  } catch {
    /* 없음 → 다운로드 */
  }
  let lastErr;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);
    try {
      const res = await fetch(ORIGIN + rel, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error("빈 응답");
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, buf);
      await sleep(REQUEST_GAP_MS);
      return "saved";
    } catch (e) {
      lastErr = e;
    }
  }
  await recordFailure("image", rel, lastErr);
  return "failed";
}

/* ───────────────────────── main ───────────────────────── */

async function main() {
  const t0 = Date.now();
  await fs.mkdir(SIZES_DIR, { recursive: true });
  if (FRESH) console.log("--fresh: 기존 산출물을 무시합니다");

  // 1단계: 연식/차종 (제조사별 체크포인트)
  const makers = await scrapeMakers();
  const yearRows = Object.values(makers).reduce((n, m) => n + m.years.length, 0);
  const carRows = Object.values(makers).reduce(
    (n, m) => n + Object.values(m.cars).reduce((k, arr) => k + arr.length, 0),
    0,
  );
  console.log(`  → makers.json (연식 ${yearRows}행, 차종 ${carRows}행)`);

  // 2단계: 사이즈 (제조사 파일 단위 체크포인트)
  const counter = { done: 0, total: carRows };
  console.log(`[2/3] 사이즈 목록 수집 (${carRows} 제조사×연식×차종)`);
  const images = new Set();
  let sizeEntries = 0;
  let sizeFiles = 0;
  for (const mk of MAKER_CODES) {
    const sizes = await scrapeSizesForMaker(mk, makers[mk], counter);
    sizeFiles++;
    for (const v of Object.values(sizes)) {
      sizeEntries++;
      if (v.carimg) images.add(v.carimg);
    }
    console.log(`  제조사 ${mk}: 사이즈 항목 ${Object.keys(sizes).length} 저장`);
  }
  console.log(`  → sizes/<maker>.json ${sizeFiles}개 (항목 ${sizeEntries})`);

  // 3단계: 이미지
  const list = [...images];
  console.log(`[3/3] 이미지 ${list.length}개 다운로드`);
  const imgStat = { saved: 0, skipped: 0, failed: 0 };
  await runPool(
    list.map((rel) => async () => {
      imgStat[await downloadImage(rel)]++;
    }),
    CONCURRENCY,
    (d, t) => progress("  이미지", d, t),
  );

  // 요약
  await saveFailures();
  console.log("\n===== 완료 =====");
  console.log(`제조사       : ${MAKER_CODES.length}`);
  console.log(`연식 행      : ${yearRows}`);
  console.log(`차종 행      : ${carRows}`);
  console.log(`사이즈 항목  : ${sizeEntries} / ${carRows} (파일 ${sizeFiles}개)`);
  console.log(`이미지       : 고유 ${list.length} / 저장 ${imgStat.saved} / 기존 ${imgStat.skipped} / 실패 ${imgStat.failed}`);
  console.log(`실패         : ${failures.length} (data/carfind/failures.json — 다시 실행하면 빠진 항목만 재요청)`);
  for (const f of failures.slice(0, 50)) console.log(`  - ${f.kind} ${f.key}: ${f.error}`);
  if (failures.length > 50) console.log(`  ... 외 ${failures.length - 50}건`);
  console.log(`소요 시간    : ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
