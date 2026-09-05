import type { Metadata } from "next";
import TprodIntro from "@/components/tire/tprodintro/TprodIntro";
import type { TireList } from "@/lib/tprodintro";
import type { Tinfo } from "@/lib/tinfo";
import listJson from "@/data/tprodintro.json";
import tinfoJson from "@/data/tinfo.json";

/* 원본 <title> */
export const metadata: Metadata = {
  title: "타이어소개 | 타이어공장 - 전브랜드 인터넷가 판매",
};

/**
 * 타이어소개 (/product/tprodintro)
 * 정적 JSON(목록 + 상세)을 읽어 클라이언트 필터 컴포넌트에 넘긴다.
 * 필터/페이지 상태는 URL 쿼리(?brand=&type=&level=&q=&page=)로 유지.
 */
export default function TprodIntroPage() {
  const list = listJson as TireList;
  const tinfo = tinfoJson as Record<string, Tinfo>;

  /* 브랜드명 입력란 검색에 쓸 seq → 모델명 */
  const models: Record<string, string> = {};
  for (const [seq, t] of Object.entries(tinfo)) models[seq] = t.model;

  return <TprodIntro items={list.items} models={models} />;
}
