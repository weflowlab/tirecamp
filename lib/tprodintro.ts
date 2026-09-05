/**
 * 타이어소개(/product/tprodintro) 목록 데이터 타입 + 필터 상수/로직
 * (data/tprodintro.json 은 scripts/scrape-tprodintro.mjs 가 생성)
 */

/** 목록 카드 한 장 (원본 카드 마크업에서 추출한 값) */
export type TireListItem = {
  seq: string;
  image: string; // /prodimg/tire/listimg/...
  brandCode: string; // /images/companylogo/<code>.gif
  brandName: string;
  typeLabel: string; // 카드 "타입 | 등급" 의 왼쪽 (승용차용 / SUV/RV / 겨울용(스노우) / 승용/SUV)
  levelLabel: string; // 오른쪽 (프리미엄 / 최고급형 / 고급형 / 일반형 / 사계절용 / 전기차 ...)
  price: string; // "233,000 ~ 463,000"
  typeCode: string | null; // 원본 seltype() 코드 — 필터 결과에 포함된 경우만
  levelCode: string | null; // 원본 sellevel() 코드 — 필터 결과에 포함된 경우만
};

export type TireList = { total: number; perPage: number; items: TireListItem[] };

/** 타입별 링크 (원본 seltype 인자/라벨) */
export const TYPES: { code: string; name: string }[] = [
  { code: "10", name: "승용차용" },
  { code: "15", name: "SUV/RV" },
  { code: "20", name: "겨울용" },
];

/** 등급별 링크 (원본 sellevel 인자/라벨) */
export const LEVELS: { code: string; name: string }[] = [
  { code: "10", name: "프리미엄" },
  { code: "15", name: "최고급형" },
  { code: "20", name: "고급형" },
  { code: "25", name: "일반형" },
  { code: "30", name: "출고용(OE)" },
];

/** 한 페이지 카드 수 (원본 32개, 4열 × 8행) */
export const PER_PAGE = 32;

/** URL 쿼리에서 읽은 필터 상태 */
export type ListFilter = {
  brands: string[]; // 빈 배열 = 전체
  type: string; // "" = 전체
  level: string; // "" = 전체
  q: string; // 브랜드명 입력란 (원본은 모델명 부분일치)
  page: number;
};

/** 원본 서버 필터와 같은 규칙으로 목록을 거른다 (브랜드는 OR, 타입/등급은 코드 일치, 검색어는 모델명 부분일치) */
export function filterItems(items: TireListItem[], f: ListFilter, models: Record<string, string>): TireListItem[] {
  const q = f.q.trim().toLowerCase();
  return items.filter((it) => {
    if (f.brands.length && !f.brands.includes(it.brandCode)) return false;
    if (f.type && it.typeCode !== f.type) return false;
    if (f.level && it.levelCode !== f.level) return false;
    if (q && !(models[it.seq] ?? "").toLowerCase().includes(q)) return false;
    return true;
  });
}
