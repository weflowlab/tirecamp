import type { Metadata } from "next";
import TinfoView from "@/components/tire/tinfo/TinfoView";
import type { Tinfo } from "@/lib/tinfo";
import tinfoJson from "@/data/tinfo.json";

/* 원본 팝업 <title> */
export const metadata: Metadata = {
  title: "타이어공장 - 전브랜드 인터넷가 판매 :: 타이어 제품정보",
};

/**
 * 타이어 상세 팝업 (/product/tinfo/view?tinfoseq=N)
 * - 원본 tireinfowin() 이 window.open 으로 여는 795x675 창. 헤더/푸터는 SiteChrome 이 이 경로에서 생략한다.
 * - data/tinfo.json (scripts/scrape-tinfo.mjs 가 생성) 만 사용한다. 없는 seq 는 "찾을 수 없습니다" 안내.
 */
export default async function TinfoViewPage({ searchParams }: { searchParams: Promise<{ tinfoseq?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.tinfoseq) ? sp.tinfoseq[0] : sp.tinfoseq;
  const seq = (raw ?? "").trim();

  const cache = tinfoJson as Record<string, Tinfo>;
  const tinfo: Tinfo | null = cache[seq] ?? null;

  if (!tinfo || !tinfo.model) {
    return (
      <div className="self-start w-[766px] p-[21px] text-[9pt] max-pc:w-full">
        해당 제품 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return <TinfoView tinfo={tinfo} />;
}
