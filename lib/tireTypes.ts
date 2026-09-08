/*
 * 타이어 제품/가격 타입 + 순수 헬퍼 — 클라이언트 컴포넌트에서도 import 하므로 node 전용 모듈을 넣지 않는다.
 * (DB/파일 읽기 등 서버 전용 로직은 lib/tires.ts)
 */
import type { TinfoScore } from "@/lib/tinfo";

/** 타이어 제품 1개 (관리자 > 타이어 관리에서 편집) */
export type TireRecord = {
  seq: string;
  brandCode: string; // /images/companylogo/<code>.webp, 검색 필터 brandop 코드
  brandName: string;
  model: string;
  /** 대표 이미지 (목록 카드/상세 첫 장) */
  image: string;
  /** 추가 갤러리 이미지 (매장에서 찍은 사진 등) */
  images: string[];
  typeLabel: string; // 승용차용 / SUV/RV / 겨울용(스노우) …
  levelLabel: string; // 프리미엄 / 최고급형 / 고급형 / 일반형 …
  typeCode: string; // 타이어소개 타입 필터 코드 ("" = 필터 대상 아님)
  levelCode: string; // 등급 필터 코드
  /** 한 줄 소개 (상세 모달 제목 아래) */
  tagline: string;
  /** 우리가 쓴 설명 */
  desc: string;
  /** 원본 제품 설명 (검색 결과 카드의 회색 설명) */
  descHtml: string;
  speedRating: string;
  treadwear: string;
  /** 가격대 표시 문구. 가격 행이 있으면 자동 계산값이 우선 */
  priceRange: string;
  /** 정렬용 성능 점수 (화면에는 안 씀) */
  scores: TinfoScore[];
  /** false 면 사이트 전체에서 숨김 */
  visible: boolean;
  sortOrder: number;
  updatedAt: string;
};

/** 사이즈별 가격 1행 (검색 결과 카드 1장의 원천) */
export type TirePrice = {
  id: string;
  /** 사이즈 코드 7자리 (2254518) */
  size: string;
  tireSeq: string;
  speedGrade: string; // "Y" ("" 이면 표시 없음)
  marketPrice: number; // 시중가
  salePrice: number; // 할인가 (카드 표시 가격)
  cashPrice: number; // 최대 할인가 (할인율 계산 기준)
  /** 빨간 변형 문구 ("흡음재", "런플랫", "장착 비용 포함 된 가격 입니다." 등) */
  comment: string;
  strength: string;
  isBest: boolean;
  visible: boolean;
};

export const TIRE_TYPES: { code: string; name: string }[] = [
  { code: "10", name: "승용차용" },
  { code: "15", name: "SUV/RV" },
  { code: "20", name: "겨울용(스노우)" },
];

export const TIRE_LEVELS: { code: string; name: string }[] = [
  { code: "10", name: "프리미엄" },
  { code: "15", name: "최고급형" },
  { code: "20", name: "고급형" },
  { code: "25", name: "일반형" },
  { code: "30", name: "출고용(OE)" },
];

/** 속도등급 → 최고속도 (툴팁용) */
const SPEED_KM: Record<string, number> = { Q: 160, R: 170, S: 180, T: 190, U: 200, H: 210, V: 240, W: 270, Y: 300, ZR: 240 };

export function speedTitle(grade: string): string {
  const g = grade.trim().toUpperCase();
  if (!g) return "";
  const km = SPEED_KM[g];
  return km ? `속도등급:${g} (${km}km까지)` : `속도등급:${g}`;
}

/** "↓최대55% 할인" — 정가(시중가) 대비 판매가 기준 */
export function discountText(marketPrice: number, salePrice: number): string {
  if (marketPrice <= 0 || salePrice <= 0 || salePrice >= marketPrice) return "";
  return `↓최대 ${Math.round((1 - salePrice / marketPrice) * 100)}% 할인`;
}

/** 가격 행들로 "78,000 ~ 120,000" 가격대 문구 (할인가 기준) */
export function priceRangeOf(prices: { salePrice: number }[]): string {
  const v = prices.map((p) => p.salePrice).filter((n) => n > 0);
  if (v.length === 0) return "";
  const min = Math.min(...v);
  const max = Math.max(...v);
  const f = (n: number) => n.toLocaleString("ko-KR");
  return min === max ? f(min) : `${f(min)} ~ ${f(max)}`;
}

/** HTML 태그 제거 (카드용 평문 설명) */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
