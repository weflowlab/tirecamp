import type { Metadata } from "next";
import { TireDetailContent } from "@/components/tire/TireDetailModal";
import { toTireDetail } from "@/lib/tireDetail";
import { displayPriceRange, getTire } from "@/lib/tires";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("타이어 제품정보"),
};

/* 관리자 수정이 바로 보이도록 요청마다 읽는다 */
export const dynamic = "force-dynamic";

/**
 * 타이어 상세 페이지 (/product/tinfo/view?tinfoseq=N)
 * - 보통은 목록에서 모달로 열리지만, 직접 링크로 들어온 경우를 위해 같은 본문을 페이지로 렌더
 * - 헤더/푸터는 SiteChrome 이 이 경로에서 생략한다
 */
export default async function TinfoViewPage({ searchParams }: { searchParams: Promise<{ tinfoseq?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.tinfoseq) ? sp.tinfoseq[0] : sp.tinfoseq;
  const seq = (raw ?? "").trim();

  const t = await getTire(seq);
  if (!t || !t.model) {
    return <div className="w-[960px] self-start p-[40px] font-sans text-[13px] text-muted max-pc:w-full">해당 제품 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="w-[960px] self-start max-pc:w-full">
      <TireDetailContent data={toTireDetail(t, await displayPriceRange(t))} />
    </div>
  );
}
