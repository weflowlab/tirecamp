/*
 * 후기 타입/상수 — 클라이언트 컴포넌트에서도 import 하는 파일이므로 node 전용 모듈(fs 등)을 절대 import 하지 않는다.
 * (파일 읽기/정렬 등 서버 전용 로직은 lib/reviews.ts)
 */

export const VEHICLE_TYPES = ["승용차", "SUV · RV", "화물 · 1톤", "수입차", "기타"] as const;

/* 고객 후기 1건 (data/reviews.json) */
export type Review = {
  id: number;
  name: string;
  /** 차량 유형 (필수) */
  vehicle: (typeof VEHICLE_TYPES)[number];
  /** 차종 (선택, 예: 아반떼 CN7) */
  car: string;
  /** 별점 1~5 */
  rating: number;
  content: string;
  date: string;
  createdAt: string;
};
