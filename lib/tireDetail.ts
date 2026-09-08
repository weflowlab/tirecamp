/*
 * 타이어 상세(모달/페이지) 공용 데이터 — 클라이언트에서도 import 하므로 node 전용 모듈 없음
 * - TireRecord(관리자에서 편집한 제품 정보) → 화면용 구조로
 * - 주관적 점수(성능 막대, 리뷰평점, 주장점)는 쓰지 않는다 → 속도등급 · 트레드웨어 · 가격대 · 타입/등급만
 */
import type { TireRecord } from "@/lib/tireTypes";
import { stripHtml } from "@/lib/tireTypes";

/** data/tireNotes.json 의 한 줄 소개/설명 (DB 초기 적재용) */
export type TireNote = { tagline: string; desc: string };

export type TireDetail = {
  seq: string;
  brand: string;
  model: string;
  /** 한 줄 소개 (없으면 원본 설명 첫 문장) */
  tagline: string;
  /** 설명 (없으면 "") */
  desc: string;
  /** 타입 · 등급 (예: "승용차용 · 프리미엄") */
  typeLevel: string;
  speedRating: string;
  treadwear: string;
  priceRange: string;
  /** 갤러리 이미지 (대표 이미지 + 추가 이미지) */
  images: string[];
};

/** 첫 문장 */
function firstSentence(html: string): string {
  const text = stripHtml(html);
  const m = text.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

export function toTireDetail(t: TireRecord, priceRange?: string): TireDetail {
  return {
    seq: t.seq,
    brand: t.brandName,
    model: t.model,
    tagline: t.tagline || firstSentence(t.descHtml),
    desc: t.desc,
    typeLevel: [t.typeLabel, t.levelLabel].filter(Boolean).join(" · "),
    speedRating: t.speedRating.replace(/^[,\s]+/, "").replace(/,/g, " · "),
    treadwear: t.treadwear,
    priceRange: priceRange || t.priceRange,
    images: [t.image, ...t.images].filter(Boolean),
  };
}
