/*
 * 타이어 사이즈 검색 결과(/product/tire/sizelist) 데이터 계층 — 완전 오프라인
 * - 원본: http://tirekongjang.com/product/tire/sizelist.aspx (form POST 결과 HTML) 을
 *   scripts/scrape-sizelist.mjs 가 사이즈별로 전수 파싱해 둔 data/sizelist/<code>.json 을 읽는다.
 * - 탭(seltireg) / 제조사(brandop) / 정렬(sorttireop) / 페이지(lpage) / 앞뒤 사이즈 조합(frchk) 은
 *   원본 서버의 동작을 그대로 흉내내어 여기서 처리한다. 런타임 네트워크 호출은 없다.
 * - 서버 전용 (fs/path 사용). 클라이언트 컴포넌트는 lib/sizelistQuery.ts 만 import 할 것
 */

import { promises as fs } from "fs";
import path from "path";
import { BRANDS } from "./tireSizeOptions";
import type { Tinfo } from "./tinfo";
import tinfoJson from "@/data/tinfo.json";

/* 타입/URL query 유틸은 클라이언트 공용 모듈(lib/sizelistQuery.ts)에서 가져와 재노출 */
import type { SizeListQuery, SizeListResult, TireItem, PageLink } from "./sizelistQuery";
export * from "./sizelistQuery";
/* HTML 파서는 스크립트와 공유하는 순수 모듈 (여기서는 재노출만) */
export { parseSizeListHtml, buildPostBody } from "./sizelistParser";

/* 원본 한 페이지 목록 카드 수 (23개 → 2페이지) */
export const PAGE_SIZE = 20;

/* data/sizelist/<code>.json 의 형태 (베스트 섹션 중복 카드는 저장하지 않음) */
type SizeFile = { size: string; total: number; tires: TireItem[] };

const TINFO = tinfoJson as Record<string, Tinfo>;

/* ---------- 정적 파일 로드 ---------- */

/* 사이즈 코드 → 저장된 목록 (없거나 형식이 아니면 빈 목록). 프로세스 내 메모리 캐시 */
const fileCache = new Map<string, TireItem[]>();
async function loadSizeFile(code: string): Promise<TireItem[]> {
  if (!/^\d{7}$/.test(code)) return [];
  const hit = fileCache.get(code);
  if (hit) return hit;
  let tires: TireItem[] = [];
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data", "sizelist", `${code}.json`), "utf8");
    tires = (JSON.parse(raw) as SizeFile).tires ?? [];
  } catch {
    /* 결과 없는 사이즈 (파일 없음) */
  }
  fileCache.set(code, tires);
  return tires;
}

/* ---------- 탭 / 제조사 필터 ---------- */

/* 상세 팝업의 "타입 / 등급" 문구 ("승용차용 / 프리미엄") 에서 등급 코드 추출 — 원본 sellevel 코드와 동일 */
const LEVEL_CODES: Record<string, string> = { 프리미엄: "10", 최고급형: "15", 고급형: "20", 일반형: "25" };
function levelCode(seq: string): string {
  const tl = TINFO[seq]?.typeLevel ?? "";
  const label = tl.split("/").pop()?.trim() ?? "";
  return LEVEL_CODES[label] ?? "";
}

/* 겨울용(스노우) 타입 여부 */
function isWinter(seq: string): boolean {
  return (TINFO[seq]?.typeLevel ?? "").includes("겨울");
}

/* 원본 탭(seltireg): all 전체 / main 베스트(추천) / 10 프리미엄 / 15 최고급 / 20 고급 / 25 일반 / snow 겨울용 */
function matchTab(t: TireItem, seltireg: string): boolean {
  switch (seltireg) {
    case "main":
      return t.isBest;
    case "snow":
      return isWinter(t.tinfoseq);
    case "10":
    case "15":
    case "20":
    case "25":
      return levelCode(t.tinfoseq) === seltireg;
    default:
      return true;
  }
}

/* 브랜드명 → 원본 brandop 코드 */
const BRAND_CODE = new Map(BRANDS.map((b) => [b.name, b.code]));
function brandCode(t: TireItem): string {
  return BRAND_CODE.get(t.brand) ?? "";
}

/* ---------- 정렬 ---------- */

/* 팝업 성능 그래프 점수 (width = 점수 × 12px). 없으면 0 */
function score(seq: string, label: string): number {
  const s = TINFO[seq]?.scores.find((x) => x.label === label);
  return s ? Math.round(s.width / 12) : 0;
}

type Cmp = (a: TireItem, b: TireItem) => number;
const bySeqAsc: Cmp = (a, b) => Number(a.tinfoseq) - Number(b.tinfoseq);
const byPriceAsc: Cmp = (a, b) => a.front.salePrice - b.front.salePrice;
const byPriceDesc: Cmp = (a, b) => b.front.salePrice - a.front.salePrice;
const chain =
  (...cs: Cmp[]): Cmp =>
  (a, b) => {
    for (const c of cs) {
      const r = c(a, b);
      if (r !== 0) return r;
    }
    return 0;
  };
/* 점수 내림차순 비교자 */
const scoreDesc = (label: string): Cmp => (a, b) => score(b.tinfoseq, label) - score(a.tinfoseq, label);

/*
 * 원본 sorttireop 재현 (원본 결과와 대조해 확정한 규칙)
 *  2 낮은가격순: 할인가 ↑, 동률이면 tinfoseq ↑
 *  3 높은가격순: 할인가 ↓, 동률이면 tinfoseq ↑
 *  1 브랜드별: 브랜드 코드 ↑ (한국10 → 금호14 → 넥센16 → 미쉐린20 → 브리지스톤21 → 피렐리22 → 콘티넨탈23 …), tinfoseq ↑, 할인가 ↓
 *  4 제품수명: 제품수명 ↓, tinfoseq ↑, 할인가 ↓
 *  5 승차감·정숙성: 승차감 ↓, 정숙성 ↓, tinfoseq ↑, 할인가 ↓ (원본 팝업의 승차감은 항상 0 → 사실상 정숙성 순)
 *  6 접지력·고속주행: 고속주행성 ↓, 접지력 ↓, tinfoseq ↑, 할인가 ↓
 */
function comparator(sorttireop: string): Cmp {
  switch (sorttireop) {
    case "3":
      return chain(byPriceDesc, bySeqAsc);
    case "1":
      return chain((a, b) => Number(brandCode(a) || 99) - Number(brandCode(b) || 99), bySeqAsc, byPriceDesc);
    case "4":
      return chain(scoreDesc("제품수명"), bySeqAsc, byPriceDesc);
    case "5":
      return chain(scoreDesc("승차감"), scoreDesc("정숙성"), bySeqAsc, byPriceDesc);
    case "6":
      return chain(scoreDesc("고속주행성"), scoreDesc("접지력"), bySeqAsc, byPriceDesc);
    default:
      return chain(byPriceAsc, bySeqAsc);
  }
}

/* ---------- 앞뒤 사이즈 조합 ---------- */

/*
 * 앞≠뒤(frchk=2) 일 때 원본은 같은 제품이 두 사이즈 모두에 있는 경우만 카드 1장(앞블럭+뒤블럭)으로 보여준다.
 * "같은 제품" 의 기준은 tinfoseq + 빨간 변형 문구(comment: "흡음재", "런플랫", "장착 비용 포함…" 등) 이다
 *  - 원본 2454518/2754018 조합에서 마제스티9 EV 는 ""↔"" , "흡음재"↔"흡음재" 로 2장이 나오고,
 *    CINTURATO P9 AS 는 앞 "" / 뒤 "런플랫" 이라 아예 나오지 않는 것으로 확인.
 * 같은 키에 줄이 여럿이면 앞/뒤 각각 낮은가격순 n번째끼리 짝을 짓고 남는 쪽은 버린다.
 * 뒤 블럭에는 할인율 문구가 없고 수량 기본값은 앞뒤 각각 2개 (원본과 동일).
 */
function combineFrontRear(front: TireItem[], rear: TireItem[]): TireItem[] {
  const group = (list: TireItem[]) => {
    const m = new Map<string, TireItem[]>();
    for (const t of [...list].sort(chain(byPriceAsc, bySeqAsc))) {
      const key = `${t.tinfoseq}|${t.comment}`;
      const arr = m.get(key) ?? [];
      arr.push(t);
      m.set(key, arr);
    }
    return m;
  };
  const fg = group(front);
  const rg = group(rear);
  const out: TireItem[] = [];
  for (const [key, fl] of fg) {
    const rl = rg.get(key);
    if (!rl) continue;
    const n = Math.min(fl.length, rl.length);
    for (let i = 0; i < n; i++) {
      const f = fl[i];
      const r = rl[i];
      out.push({
        ...f,
        isBest: f.isBest && r.isBest,
        calcId: `${f.fseq}${r.fseq}`,
        rseq: r.fseq,
        front: { ...f.front, defaultQty: 2 },
        rear: { ...r.front, discountText: "", defaultQty: 2 },
      });
    }
  }
  return out;
}

/* ---------- 페이지 ---------- */

/* 원본 MovePage(spage,lpage) 링크 목록 — 2페이지 이상일 때만 (spage 는 원본에서도 항상 1로 옴) */
function buildPages(total: number, lpage: number): PageLink[] {
  const n = Math.ceil(total / PAGE_SIZE);
  if (n < 2) return [];
  return Array.from({ length: n }, (_, i) => ({ spage: 1, lpage: i + 1, label: String(i + 1), current: i + 1 === lpage }));
}

/* ---------- 진입점 ---------- */

/*
 * 검색 상태 → 결과 (정적 데이터만 사용)
 *  1. 앞 사이즈 파일 로드 (앞≠뒤면 뒤 사이즈도 로드해 tinfoseq 로 결합)
 *  2. 탭 → 제조사 필터 → 정렬
 *  3. 페이지 자르기 (20장). 1페이지 상단에는 isBest 카드를 주황 테두리(bestSection) 로 한 번 더 출력 (원본 "베스트 타이어")
 *  4. 알 수 없는 사이즈/조건은 total 0 의 빈 결과 (원본도 "총 : 0 개" 에 카드 없음)
 */
export async function getSizeList(q: SizeListQuery): Promise<SizeListResult> {
  const query: SizeListQuery = { ...q, rtsize: q.rtsize || q.ftsize };
  const empty: SizeListResult = { query, total: 0, tires: [], pages: [], source: "static" };
  if (!query.ftsize) return empty;

  let list = await loadSizeFile(query.ftsize);
  if (query.rtsize !== query.ftsize) {
    list = combineFrontRear(list, await loadSizeFile(query.rtsize));
  }

  list = list.filter((t) => matchTab(t, query.seltireg || "all"));
  if (query.brandop.length > 0) {
    const set = new Set(query.brandop);
    list = list.filter((t) => set.has(brandCode(t)));
  }
  list = [...list].sort(comparator(query.sorttireop || "2"));

  const total = list.length;
  if (total === 0) return empty;

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const lpage = Math.min(Math.max(1, query.lpage || 1), lastPage);
  const pageItems = list.slice((lpage - 1) * PAGE_SIZE, lpage * PAGE_SIZE);
  const best = lpage === 1 ? list.filter((t) => t.isBest).map((t) => ({ ...t, bestSection: true })) : [];

  return {
    query: { ...query, lpage },
    total,
    tires: [...best, ...pageItems.map((t) => ({ ...t, bestSection: false }))],
    pages: buildPages(total, lpage),
    source: "static",
  };
}

/* 이전 이름 호환 (원격 fetch 시절의 이름) */
export const fetchSizeList = getSizeList;
