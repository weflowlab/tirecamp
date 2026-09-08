/*
 * 타이어 상세(모달/페이지) 공용 데이터 — 클라이언트에서도 import 하므로 node 전용 모듈 없음
 * - data/tinfo.json(원본 스펙) + data/tireNotes.json(우리가 쓴 한 줄 소개/설명) 을 합쳐서 화면용 구조로
 * - 주관적 점수(성능 막대, 리뷰평점, 주장점)는 쓰지 않는다 → 속도등급 · 트레드웨어 · 가격대 · 타입/등급만
 */
import type { Tinfo } from "@/lib/tinfo";

export type TireNote = { tagline: string; desc: string };

export type TireDetail = {
  seq: string;
  brand: string;
  model: string;
  /** 우리가 쓴 한 줄 소개 (없으면 원본 설명 첫 문장) */
  tagline: string;
  /** 우리가 쓴 설명 (없으면 "") */
  desc: string;
  /** 타입 · 등급 (예: "승용차용 · 프리미엄") */
  typeLevel: string;
  speedRating: string;
  treadwear: string;
  priceRange: string;
  /** 갤러리 이미지 (지금은 제품 사진 1장. 매장에서 찍은 사진이 생기면 여기에 추가) */
  images: string[];
};

/** HTML 태그 제거 후 첫 문장 */
function firstSentence(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const m = text.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

export function toTireDetail(t: Tinfo, note?: TireNote): TireDetail {
  return {
    seq: t.seq,
    brand: t.brandName,
    model: t.model,
    tagline: note?.tagline || firstSentence(t.descHtml),
    desc: note?.desc ?? "",
    typeLevel: (t.typeLevel || "").replace(/\s*\/\s*/, " · "),
    speedRating: t.speedRating.replace(/^[,\s]+/, "").replace(/,/g, " · "),
    treadwear: t.treadwear,
    priceRange: t.priceRange,
    images: [t.image].filter(Boolean),
  };
}
