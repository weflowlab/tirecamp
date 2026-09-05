import type { Metadata } from "next";
import TinfoView from "@/components/tire/tinfo/TinfoView";
import { ORIGIN, fetchTinfoHtml, parseTinfoHtml, type Tinfo } from "@/lib/tinfo";
import tinfoJson from "@/data/tinfo.json";

/* 원본 팝업 <title> */
export const metadata: Metadata = {
  title: "타이어공장 - 전브랜드 인터넷가 판매 :: 타이어 제품정보",
};

/**
 * 타이어 상세 팝업 (/product/tinfo/view?tinfoseq=N)
 * - 원본 tireinfowin() 이 window.open 으로 여는 795x675 창. 헤더/푸터는 SiteChrome 이 이 경로에서 생략한다.
 * - data/tinfo.json 에 있으면 그것을, 없으면 원본 서버에서 받아 같은 파서로 실시간 파싱한다.
 */
export default async function TinfoViewPage({ searchParams }: { searchParams: Promise<{ tinfoseq?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.tinfoseq) ? sp.tinfoseq[0] : sp.tinfoseq;
  const seq = (raw ?? "").trim();

  const cache = tinfoJson as Record<string, Tinfo>;
  let tinfo: Tinfo | null = cache[seq] ?? null;
  let imagePrefix = "";

  /* JSON 에 없는 seq → 원본 서버 fallback (이미지는 원본 경로 그대로 참조) */
  if (!tinfo && /^\d+$/.test(seq)) {
    try {
      tinfo = parseTinfoHtml(await fetchTinfoHtml(seq), seq);
      imagePrefix = ORIGIN;
    } catch {
      tinfo = null;
    }
  }

  if (!tinfo || !tinfo.model) {
    return (
      <div className="self-start w-[766px] p-[21px] text-[9pt]">
        해당 제품 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return <TinfoView tinfo={tinfo} imagePrefix={imagePrefix} />;
}
