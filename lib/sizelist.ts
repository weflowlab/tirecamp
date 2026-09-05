/*
 * 타이어 사이즈 검색 결과(/product/tire/sizelist) 데이터 계층
 * - 원본: http://tirekongjang.com/product/tire/sizelist.aspx (form POST 결과 HTML)
 * - 서버에서 원본에 POST → HTML 을 정규식으로 파싱해 JSON 으로 변환, 10분 메모리 캐시
 * - 원격 실패 시 data/sizelist-2254518.json (저장된 HTML 을 파싱한 정적 데이터) 사용
 * - 서버 전용 (fs/path 사용). 클라이언트 컴포넌트는 lib/sizelistQuery.ts 만 import 할 것
 */

import { promises as fs } from "fs";
import path from "path";

const ORIGIN = "http://tirekongjang.com";
const SIZELIST_URL = `${ORIGIN}/product/tire/sizelist.aspx`;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분
const STATIC_FALLBACK_FILE = "sizelist-2254518.json";

/* 타입/URL query 유틸은 클라이언트 공용 모듈(lib/sizelistQuery.ts)에서 가져와 재노출 */
import { type SizeListQuery, type SizeListResult, type TireItem, type SizeBlock, type PageLink } from "./sizelistQuery";
export * from "./sizelistQuery";

/* ---------- HTML 파서 ---------- */

function num(s: string | undefined): number {
  return s ? parseInt(s.replace(/[^\d]/g, ""), 10) || 0 : 0;
}

function m1(re: RegExp, s: string): string {
  const m = re.exec(s);
  return m ? (m[1] ?? "") : "";
}

/* HTML 엔티티/공백 정리 (설명문은 원본에서 줄바꿈이 공백으로 렌더링됨) */
function cleanText(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/* 카드 안의 사이즈 블럭(앞/뒤) 1개 파싱 */
function parseSizeBlock(part: string): SizeBlock {
  const speed = /<u title="속도등급:([^"]*)">([^<]*)<\/u>/.exec(part);
  return {
    size: cleanText(part.slice(0, part.indexOf("</font>"))),
    speedGrade: speed ? speed[2].trim() : "",
    speedTitle: speed ? `속도등급:${speed[1]}` : "",
    marketPrice: num(m1(/line-through">\s*<b>([\d,]+)<\/b>/, part)),
    salePrice: num(m1(/name="hcardmoney\d" value="(\d+)"/, part)),
    cashPrice: num(m1(/name="hcashmoney\d" value="(\d+)"/, part)),
    discountText: cleanText(m1(/(↓[^<]*)</, part)),
    defaultQty: num(m1(/<option value="(\d)" selected>/, part)) || 0,
  };
}

const SIZE_FONT = '<font face="Tahoma" color="#000000" style="font-size: 12pt">';

/* 카드(타이어 1개) 조각 파싱 */
function parseCard(chunk: string): TireItem | null {
  const tinfoseq = m1(/tireinfowin\('(\d+)'\)/, chunk);
  if (!tinfoseq) return null;
  const calc = /calcMoney\('(\d+)',(\d),(\d+)\)/.exec(chunk);
  const booking = /bookingSave\('(\d+)','(\d+)','(\d+)'\)/.exec(chunk);
  const parts = chunk.split(SIZE_FONT);
  const front = parseSizeBlock(parts[1] ?? "");
  const rear = parts[2] ? parseSizeBlock(parts[2]) : null;
  return {
    tinfoseq,
    brand: cleanText(m1(/<span style="font-size:16px;color:#000;font-weight:700;">([\s\S]*?)<\/span>/, chunk)),
    model: cleanText(m1(/color:#0066CC;font-weight:700;">([\s\S]*?)<\/span>/, chunk)),
    desc: cleanText(m1(/<span style="FONT-SIZE: 11px">([\s\S]*?)<\/span>/, chunk)),
    comment: cleanText(m1(/tsizecomment-style">([\s\S]*?)<\/div>/, chunk)),
    strength: cleanText(m1(/주장점:\s*<\/font>\s*<font color="#808080"><b>([\s\S]*?)<\/b>/, chunk)),
    imageUrl: m1(/<img border="0" src="([^"]+)" width=140>/, chunk),
    isBest: chunk.includes("/images/icon/besttextbox.gif"),
    bestSection: chunk.includes("border: 1px solid #c44b1c"),
    calcId: calc ? calc[1] : "",
    fseq: booking ? booking[1] : "",
    rseq: booking ? booking[2] : "",
    front,
    rear,
  };
}

/* 원본 sizelist.aspx 결과 HTML 전체 → SizeListResult (query 는 form hidden 값에서 복원) */
export function parseSizeListHtml(html: string): Omit<SizeListResult, "source"> {
  const h = html.replace(/\r\n?/g, "\n");

  /* form hidden/checked 값에서 검색 상태 복원 */
  const brandop = [...h.matchAll(/name="brandop" value="(\d+)"[^>]*checked/g)].map((m) => m[1]);
  const query: SizeListQuery = {
    ftsize: m1(/name="find_ftsize" value="(\d*)"/, h),
    rtsize: m1(/name="find_rtsize" value="(\d*)"/, h),
    seltireg: m1(/name="seltireg" value="([a-z0-9]*)"/, h) || "all",
    sorttireop: m1(/value="(\d)" name="sorttireop"\s+checked/, h) || "2",
    brandop,
    spage: num(m1(/name="spage" value="(\d+)"/, h)) || 1,
    lpage: num(m1(/name="lpage" value="(\d+)"/, h)) || 1,
  };
  if (!query.rtsize) query.rtsize = query.ftsize;

  const total = num(m1(/총 :\s*([\d,]+)\s*개/, h));

  /* 리스트 영역: <!-- 베스트 타이어 --> ~ <!-- 타이어 리스트 --> 사이, 카드 사이 구분선 aibtbar.gif 로 분할 */
  const start = h.indexOf("<!-- 베스트 타이어");
  const end = h.indexOf("<!-- 타이어 리스트");
  const region = start >= 0 && end > start ? h.slice(start, end) : "";
  const tires = region
    .split("/images/main/aibtbar.gif")
    .map(parseCard)
    .filter((t): t is TireItem => t !== null);

  /* 페이지 링크: MovePage(spage,lpage) + 굵은 글씨(font-weight: 700) 가 현재 페이지 */
  const pages: PageLink[] = [
    ...h.matchAll(/MovePage\((\d+),(\d+)\)"><font face="Arial" color="#\w+"><span style="font-size: 15pt;([^"]*)">([^<]*)<\/span>/g),
  ].map((m) => ({
    spage: num(m[1]),
    lpage: num(m[2]),
    label: cleanText(m[4]),
    current: m[3].includes("font-weight: 700"),
  }));

  return { query, total, tires, pages };
}

/* ---------- 이미지 로컬 저장 ---------- */

/* /prodimg/... 가 public 에 없으면 원본에서 내려받아 저장, 실패 시 원격 URL 반환 */
async function ensureLocalImage(src: string): Promise<string> {
  if (!src) return src;
  if (/^https?:\/\//.test(src)) return src;
  const local = path.join(process.cwd(), "public", src);
  try {
    const st = await fs.stat(local);
    if (st.size > 0) return src;
  } catch {
    /* 없음 → 다운로드 */
  }
  try {
    const res = await fetch(ORIGIN + src, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error("empty");
    await fs.mkdir(path.dirname(local), { recursive: true });
    await fs.writeFile(local, buf);
    return src;
  } catch {
    return ORIGIN + src;
  }
}

/* ---------- 원격 fetch + 캐시 ---------- */

type CacheEntry = { at: number; data: SizeListResult };
const g = globalThis as unknown as { __sizelistCache?: Map<string, CacheEntry> };
function cache(): Map<string, CacheEntry> {
  if (!g.__sizelistCache) g.__sizelistCache = new Map();
  return g.__sizelistCache;
}

/* 원본 form 필드 그대로 POST body 구성 (앞뒤 다르면 frchk=2 필요 — 없으면 서버가 find_rtsize 를 무시함) */
export function buildPostBody(q: SizeListQuery): URLSearchParams {
  const body = new URLSearchParams();
  body.set("spage", String(q.spage));
  body.set("lpage", String(q.lpage));
  body.set("findfristchk", "");
  body.set("find_ftsize", q.ftsize);
  body.set("find_rtsize", q.rtsize || q.ftsize);
  if (q.rtsize && q.rtsize !== q.ftsize) body.set("frchk", "2");
  body.set("seltireg", q.seltireg || "all");
  body.set("sorttireop", q.sorttireop || "2");
  if (q.brandop.length === 0) body.append("brandop", "all");
  else for (const b of q.brandop) body.append("brandop", b);
  return body;
}

/* 정적 폴백 JSON 로드 (data/sizelist-2254518.json) */
export async function loadStaticFallback(): Promise<Omit<SizeListResult, "source"> | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data", STATIC_FALLBACK_FILE), "utf8");
    return JSON.parse(raw) as Omit<SizeListResult, "source">;
  } catch {
    return null;
  }
}

/* 원본 서버에 POST 하여 결과 목록을 가져온다. 실패하면 정적 폴백. */
export async function fetchSizeList(q: SizeListQuery): Promise<SizeListResult> {
  const key = buildPostBody(q).toString();
  const hit = cache().get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  try {
    const res = await fetch(SIZELIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
      body: key,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`sizelist ${res.status}`);
    const html = await res.text();
    if (!html.includes("총 :")) throw new Error("unexpected html");
    const parsed = parseSizeListHtml(html);
    /* 제품 이미지 로컬 확보 (병렬) */
    const imgs = await Promise.all(parsed.tires.map((t) => ensureLocalImage(t.imageUrl)));
    parsed.tires.forEach((t, i) => (t.imageUrl = imgs[i]));
    const data: SizeListResult = { ...parsed, query: q, source: "live" };
    cache().set(key, { at: Date.now(), data });
    return data;
  } catch (err) {
    console.warn("[sizelist] remote fetch failed, using static fallback:", (err as Error).message);
    const fb = await loadStaticFallback();
    if (fb) return { ...fb, query: q, source: "static" };
    return { query: q, total: 0, tires: [], pages: [], source: "static" };
  }
}
