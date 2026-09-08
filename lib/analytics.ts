import fs from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, hasDb } from "@/lib/db";
import { kstDate } from "@/lib/store";

/*
 * 방문자 통계 저장소
 * - DATABASE_URL 이 있으면 Postgres page_views 테이블 (day 컬럼으로 기간 조회)
 * - 없으면 data/analytics/YYYY-MM-DD.json (하루 1파일, 한국 시간 기준, 로컬 개발용)
 * - 브라우저의 PageTracker → POST /api/track 로 들어온 페이지뷰를 기록한다.
 * - 관리자 화면(/admin/*)과 봇은 기록하지 않는다.
 */
const DIR = path.join(process.cwd(), "data", "analytics");

export type PageView = {
  /** "YYYY-MM-DD-랜덤" — 앞부분이 파일명이 되어 체류시간 갱신 시 바로 찾는다 */
  id: string;
  /** 기기당 하루 1개 (localStorage 기기ID + 날짜) */
  sessionId: string;
  path: string;
  referrer: string;
  /** 정규화된 유입 소스 (direct / naver / google / kakao / 도메인 …) */
  source: string;
  /** utm_medium (광고는 cpc) */
  medium: string;
  /** utm_campaign 또는 검색 키워드 */
  campaign: string;
  device: "pc" | "mobile" | "tablet";
  /** ISO 시각 */
  ts: string;
  /** 체류시간(ms), 페이지 이탈 시 갱신 */
  durationMs?: number;
  /** 최대 스크롤 도달률(%) */
  maxScroll?: number;
};

function fileOf(day: string) {
  return path.join(DIR, `${day}.json`);
}

async function readDay(day: string): Promise<PageView[]> {
  try {
    const raw = await fs.readFile(fileOf(day), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PageView[]) : [];
  } catch {
    return [];
  }
}

async function writeDay(day: string, rows: PageView[]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileOf(day), JSON.stringify(rows) + "\n", "utf8");
}

/* DB 행 → PageView */
function fromRow(r: Record<string, unknown>): PageView {
  return {
    id: String(r.id),
    sessionId: String(r.session_id),
    path: String(r.path),
    referrer: String(r.referrer ?? ""),
    source: String(r.source ?? ""),
    medium: String(r.medium ?? ""),
    campaign: String(r.campaign ?? ""),
    device: (r.device as PageView["device"]) ?? "pc",
    ts: new Date(r.ts as string).toISOString(),
    durationMs: r.duration_ms == null ? undefined : Number(r.duration_ms),
    maxScroll: r.max_scroll == null ? undefined : Number(r.max_scroll),
  };
}

export async function recordPageView(input: Omit<PageView, "id" | "ts">): Promise<string> {
  const now = Date.now();
  const day = kstDate(now);
  const id = `${day}-${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const ts = new Date(now).toISOString();

  if (hasDb()) {
    await ensureSchema();
    await getSql()`INSERT INTO page_views (id, day, session_id, path, referrer, source, medium, campaign, device, ts)
      VALUES (${id}, ${day}, ${input.sessionId}, ${input.path}, ${input.referrer}, ${input.source}, ${input.medium}, ${input.campaign}, ${input.device}, ${ts})`;
    return id;
  }
  const rows = await readDay(day);
  rows.push({ ...input, id, ts });
  await writeDay(day, rows);
  return id;
}

export async function setDuration(id: string, durationMs: number, maxScroll?: number): Promise<void> {
  const day = id.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;

  if (hasDb()) {
    await ensureSchema();
    const sql = getSql();
    // 탭 전환마다 여러 번 올 수 있으므로 더 큰 값만 남긴다
    if (maxScroll != null) {
      await sql`UPDATE page_views SET duration_ms = GREATEST(COALESCE(duration_ms, 0), ${durationMs}), max_scroll = GREATEST(COALESCE(max_scroll, 0), ${maxScroll}) WHERE id = ${id}`;
    } else {
      await sql`UPDATE page_views SET duration_ms = GREATEST(COALESCE(duration_ms, 0), ${durationMs}) WHERE id = ${id}`;
    }
    return;
  }
  const rows = await readDay(day);
  const row = rows.find((r) => r.id === id);
  if (!row) return;
  row.durationMs = Math.max(row.durationMs ?? 0, durationMs);
  if (maxScroll != null) row.maxScroll = Math.max(row.maxScroll ?? 0, maxScroll);
  await writeDay(day, rows);
}

/** from~to (YYYY-MM-DD, 양끝 포함) 기간의 페이지뷰 전체 */
export async function readRange(from: string, to: string): Promise<PageView[]> {
  if (hasDb()) {
    await ensureSchema();
    const rows = await getSql()`SELECT * FROM page_views WHERE day >= ${from} AND day <= ${to} ORDER BY ts ASC`;
    return rows.map(fromRow);
  }
  const days = listDays(from, to);
  const chunks = await Promise.all(days.map(readDay));
  return chunks.flat();
}

/** 기록이 있는 가장 오래된 날짜 (없으면 오늘) */
export async function firstRecordedDay(): Promise<string> {
  if (hasDb()) {
    await ensureSchema();
    const rows = await getSql()`SELECT MIN(day) AS day FROM page_views`;
    return (rows[0]?.day as string | null) ?? kstDate();
  }
  try {
    const files = (await fs.readdir(DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    return files.length ? files[0].slice(0, 10) : kstDate();
  } catch {
    return kstDate();
  }
}

export function listDays(from: string, to: string): string[] {
  const out: string[] = [];
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return out;
  for (let t = start; t <= end && out.length < 400; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/* ---------- 수집 시 분류 ---------- */

export function isBot(ua: string): boolean {
  return /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|headless|lighthouse/i.test(ua);
}

export function detectDevice(ua: string): PageView["device"] {
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(s)) return "tablet";
  if (/mobile|iphone|android|ipod/.test(s)) return "mobile";
  return "pc";
}

/** 인앱 브라우저는 referrer 를 숨기므로 UA 로 유입 앱을 판별 */
export function detectAppSource(ua: string): string {
  const s = ua.toLowerCase();
  if (s.includes("instagram")) return "instagram";
  if (/fban|fbav|fb_iab|fbios/.test(s)) return "facebook";
  if (s.includes("kakaotalk")) return "kakao";
  if (/\bband\//.test(s)) return "band";
  if (s.includes("naver")) return "naver";
  if (/line\//.test(s)) return "line";
  if (s.includes("daumapps")) return "daum";
  return "";
}

/** referrer 도메인 → 유입 소스 정규화 */
export function normalizeSource(referrer: string, host: string): string {
  if (!referrer) return "direct";
  let h = "";
  try {
    h = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  const own = host.split(":")[0].toLowerCase();
  if (own && (h === own || h.endsWith("." + own))) return "direct";
  if (h.includes("kakao")) return "kakao";
  if (h.includes("naver")) return "naver";
  if (h.includes("instagram")) return "instagram";
  if (h.includes("facebook")) return "facebook";
  if (h.includes("google")) return "google";
  if (h.includes("daum")) return "daum";
  if (h === "t.co" || h.includes("twitter") || h.includes("x.com")) return "twitter";
  if (h.includes("youtube")) return "youtube";
  if (h.includes("bing")) return "bing";
  return h.replace(/^www\./, "");
}

/* ---------- 통계 집계 (관리자 화면용) ---------- */

export type Bucket = { key: string; label: string; count: number };

export type Stats = {
  visitors: number;
  pageViews: number;
  /** 페이지 1개만 보고 나간 방문자 비율(%) */
  bounceRate: number;
  /** 평균 체류시간(초), 측정된 페이지뷰 기준 */
  avgDurationSec: number;
  /** 평균 스크롤 도달률(%) */
  avgScroll: number;
  daily: { day: string; visitors: number; pageViews: number }[];
  hourly: number[];
  sources: Bucket[];
  devices: Bucket[];
  pages: Bucket[];
  keywords: Bucket[];
  referrers: Bucket[];
  /** 광고(cpc/paid) 로 들어온 방문자 수 */
  paidVisitors: number;
};

export const SOURCE_LABEL: Record<string, string> = {
  direct: "직접 방문·즐겨찾기",
  naver: "네이버",
  google: "구글",
  kakao: "카카오톡",
  instagram: "인스타그램",
  facebook: "페이스북",
  daum: "다음",
  band: "네이버 밴드",
  line: "라인",
  youtube: "유튜브",
  twitter: "X(트위터)",
  bing: "빙",
};

export const DEVICE_LABEL: Record<PageView["device"], string> = {
  pc: "PC",
  mobile: "모바일",
  tablet: "태블릿",
};

export const PAGE_LABEL: Record<string, string> = {
  "/": "홈",
  "/product/tire/searchbysize": "사이즈 검색",
  "/product/tire/searchbycar": "차량 검색",
  "/product/tire/searchresult": "검색 결과",
  "/product/tprodintro": "타이어 소개",
  "/company": "회사소개",
  "/cscenter/news": "공지사항",
  "/cscenter/news/view": "공지 상세",
  "/cscenter/tfaq": "자주 묻는 질문",
  "/review": "고객 후기",
  "/contact": "문의하기",
};

function top(map: Map<string, number>, label: (k: string) => string, limit = 10): Bucket[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, label: label(key), count }));
}

export function aggregate(rows: PageView[], days: string[]): Stats {
  const sessions = new Map<string, PageView[]>();
  for (const r of rows) {
    const arr = sessions.get(r.sessionId);
    if (arr) arr.push(r);
    else sessions.set(r.sessionId, [r]);
  }

  const dailyMap = new Map(days.map((d) => [d, { day: d, visitors: new Set<string>(), pageViews: 0 }]));
  const hourly = new Array<number>(24).fill(0);
  const sources = new Map<string, number>();
  const devices = new Map<string, number>();
  const pages = new Map<string, number>();
  const keywords = new Map<string, number>();
  const referrers = new Map<string, number>();
  let paid = 0;

  for (const r of rows) {
    const day = r.id.slice(0, 10);
    const d = dailyMap.get(day);
    if (d) {
      d.visitors.add(r.sessionId);
      d.pageViews += 1;
    }
    const kstHour = new Date(new Date(r.ts).getTime() + 9 * 3600 * 1000).getUTCHours();
    hourly[kstHour] += 1;
    pages.set(r.path, (pages.get(r.path) ?? 0) + 1);
  }

  let bounced = 0;
  for (const [, views] of sessions) {
    const first = views.slice().sort((a, b) => a.ts.localeCompare(b.ts))[0];
    sources.set(first.source, (sources.get(first.source) ?? 0) + 1);
    devices.set(first.device, (devices.get(first.device) ?? 0) + 1);
    if (first.campaign) keywords.set(first.campaign, (keywords.get(first.campaign) ?? 0) + 1);
    if (first.referrer && first.source !== "direct") {
      let host = first.referrer;
      try {
        host = new URL(first.referrer).hostname.replace(/^www\./, "");
      } catch {}
      referrers.set(host, (referrers.get(host) ?? 0) + 1);
    }
    if (views.some((v) => v.medium === "cpc" || v.medium === "paid")) paid += 1;
    if (views.length === 1) bounced += 1;
  }

  const measured = rows.filter((r) => typeof r.durationMs === "number" && r.durationMs > 0);
  const scrolled = rows.filter((r) => typeof r.maxScroll === "number");
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  return {
    visitors: sessions.size,
    pageViews: rows.length,
    bounceRate: sessions.size ? Math.round((bounced / sessions.size) * 100) : 0,
    avgDurationSec: Math.round(avg(measured.map((r) => r.durationMs!)) / 1000),
    avgScroll: Math.round(avg(scrolled.map((r) => r.maxScroll!))),
    daily: [...dailyMap.values()].map((d) => ({ day: d.day, visitors: d.visitors.size, pageViews: d.pageViews })),
    hourly,
    sources: top(sources, (k) => SOURCE_LABEL[k] ?? k),
    devices: top(devices, (k) => DEVICE_LABEL[k as PageView["device"]] ?? k),
    pages: top(pages, (k) => PAGE_LABEL[k] ?? k),
    keywords: top(keywords, (k) => k),
    referrers: top(referrers, (k) => k),
    paidVisitors: paid,
  };
}
