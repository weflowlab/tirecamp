import type { Metadata } from "next";
import TprodIntro from "@/components/tire/tprodintro/TprodIntro";
import type { TireListItem } from "@/lib/tprodintro";
import { getPriceRanges, getTires } from "@/lib/tires";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("타이어소개"),
};

/* 관리자 수정이 바로 보이도록 요청마다 읽는다 */
export const dynamic = "force-dynamic";

/**
 * 타이어소개 (/product/tprodintro)
 * 제품 목록(관리자 > 타이어 관리)을 읽어 클라이언트 필터 컴포넌트에 넘긴다.
 * 필터/페이지 상태는 URL 쿼리(?brand=&type=&level=&q=&page=)로 유지.
 */
export default async function TprodIntroPage() {
  const [tires, ranges] = await Promise.all([getTires(), getPriceRanges()]);

  const items: TireListItem[] = tires.map((t) => ({
    seq: t.seq,
    image: t.image,
    brandCode: t.brandCode,
    brandName: t.brandName,
    typeLabel: t.typeLabel,
    levelLabel: t.levelLabel,
    price: ranges.get(t.seq) || t.priceRange,
    typeCode: t.typeCode || null,
    levelCode: t.levelCode || null,
  }));

  /* 브랜드명 입력란 검색에 쓸 seq → 모델명 */
  const models: Record<string, string> = {};
  for (const t of tires) models[t.seq] = t.model;

  return <TprodIntro items={items} models={models} />;
}
