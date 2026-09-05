/*
 * 타이어 사이즈 검색 결과(/product/tire/sizelist) — 클라이언트/서버 공용 순수 유틸
 * - 타입 정의, 사이즈 정규화, URL query ↔ 검색 상태 변환 (fs 등 node 전용 모듈 없음)
 * - 서버 전용 fetch/파서는 lib/sizelist.ts
 */

/* ---------- 타입 ---------- */

/* 원본 form(name="frm") 의 hidden/입력 필드와 1:1 대응하는 검색 상태 */
export type SizeListQuery = {
  ftsize: string; // find_ftsize (숫자만, 예 2254518)
  rtsize: string; // find_rtsize (앞뒤 동일하면 ftsize 와 같음)
  seltireg: string; // 탭: all | main | 10 | 15 | 20 | 25 | snow
  sorttireop: string; // 정렬: 1 브랜드별, 2 낮은가격, 3 높은가격, 4 수명, 5 승차감, 6 접지력
  brandop: string[]; // 제조사 코드 목록 (빈 배열 = 전체브랜드)
  spage: number; // 페이지 블럭 시작 (원본 MovePage 의 spage)
  lpage: number; // 현재 페이지
};

/* 카드 안의 사이즈 1개(앞 또는 뒤) 가격/규격 블럭 */
export type SizeBlock = {
  size: string; // "225/45R18"
  speedGrade: string; // "Y" ("" 이면 표시 없음)
  speedTitle: string; // "속도등급:Y (300km까지)" (u title 툴팁)
  marketPrice: number; // 시중가 (취소선)
  salePrice: number; // 할인가 (hcardmoney)
  cashPrice: number; // 최대할인가 (hcashmoney, 원본은 display:none)
  discountText: string; // "↓최대51% 할인" (앞타이어 블럭에만 있음)
  defaultQty: number; // 수량 select 기본 선택값 (4 또는 앞뒤일 때 2)
};

/* 결과 카드 1개 */
export type TireItem = {
  tinfoseq: string; // tireinfowin('NNNN') 상세 팝업 키
  brand: string;
  model: string;
  desc: string; // 회색 11px 설명
  comment: string; // 빨간 .tsizecomment-style 문구 (예: "장착 비용 포함 된 가격 입니다.")
  strength: string; // "주장점: 승차감, 정숙성" 의 굵은 부분 (없으면 "")
  imageUrl: string; // 로컬 /prodimg/... 또는 원격 URL
  isBest: boolean; // besttextbox.gif 뱃지
  bestSection: boolean; // 상단 주황 테두리(#c44b1c) 베스트 섹션 카드
  calcId: string; // calcMoney('ID', frtype, inx) 의 ID
  fseq: string; // bookingSave(fseq, rseq, inx)
  rseq: string;
  front: SizeBlock;
  rear: SizeBlock | null; // 앞뒤 사이즈가 다를 때만
};

/* 하단 페이지 링크 (원본 MovePage(spage,lpage)) */
export type PageLink = { spage: number; lpage: number; label: string; current: boolean };

export type SizeListResult = {
  query: SizeListQuery;
  total: number; // "총 : N 개"
  tires: TireItem[];
  pages: PageLink[];
  source: "live" | "static"; // static = 원격 실패로 정적 데이터 사용
};

/* ---------- 검색 상태(URL query) 유틸 ---------- */

/* "225/45R18", "225 45 18", "2254518" 등을 숫자만 남긴 "2254518" 로 정규화 (원본 서버는 숫자만 인식) */
export function normalizeSize(raw: string | undefined | null): string {
  return (raw ?? "").replace(/\D/g, "");
}

/* 7자리 숫자 사이즈 → {width, ratio, inch} (select 프리셋용). 형식이 아니면 null */
export function splitSize(size: string): { width: string; ratio: string; inch: string } | null {
  if (!/^\d{7}$/.test(size)) return null;
  return { width: size.slice(0, 3), ratio: size.slice(3, 5), inch: size.slice(5, 7) };
}

/* 7자리 → "225/45R18" 표기 */
export function formatSize(size: string): string {
  const s = splitSize(size);
  return s ? `${s.width}/${s.ratio}R${s.inch}` : size;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

/* page.tsx 의 searchParams → SizeListQuery (기본값: 전체탭 / 낮은가격순 / 전체브랜드 / 1페이지) */
export function parseSizeListQuery(sp: RawSearchParams): SizeListQuery {
  const ftsize = normalizeSize(first(sp.find_ftsize));
  const rt = normalizeSize(first(sp.find_rtsize));
  const rtsize = rt || ftsize;
  const seltireg = first(sp.seltireg) || "all";
  const sorttireop = /^[1-6]$/.test(first(sp.sorttireop)) ? first(sp.sorttireop) : "2";
  const rawBrand = sp.brandop === undefined ? [] : Array.isArray(sp.brandop) ? sp.brandop : [sp.brandop];
  const brandop = rawBrand.filter((b) => /^\d+$/.test(b));
  const lpage = Math.max(1, parseInt(first(sp.lpage), 10) || 1);
  const spage = Math.max(1, parseInt(first(sp.spage), 10) || 1);
  return { ftsize, rtsize, seltireg, sorttireop, brandop, spage, lpage };
}

/* SizeListQuery → /product/tire/sizelist?... (기본값은 생략해 URL 을 짧게 유지) */
export function buildSizeListHref(q: SizeListQuery): string {
  const p = new URLSearchParams();
  p.set("find_ftsize", q.ftsize);
  if (q.rtsize && q.rtsize !== q.ftsize) p.set("find_rtsize", q.rtsize);
  if (q.seltireg && q.seltireg !== "all") p.set("seltireg", q.seltireg);
  if (q.sorttireop && q.sorttireop !== "2") p.set("sorttireop", q.sorttireop);
  for (const b of q.brandop) p.append("brandop", b);
  if (q.spage > 1) p.set("spage", String(q.spage));
  if (q.lpage > 1) p.set("lpage", String(q.lpage));
  return `/product/tire/sizelist?${p.toString()}`;
}
