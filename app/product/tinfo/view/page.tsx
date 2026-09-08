import type { Metadata } from "next";
import { TireDetailContent } from "@/components/tire/TireDetailModal";
import type { Tinfo } from "@/lib/tinfo";
import { toTireDetail, type TireNote } from "@/lib/tireDetail";
import tinfoJson from "@/data/tinfo.json";
import notesJson from "@/data/tireNotes.json";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("타이어 제품정보"),
};

/**
 * 타이어 상세 페이지 (/product/tinfo/view?tinfoseq=N)
 * - 보통은 목록에서 모달로 열리지만, 직접 링크로 들어온 경우를 위해 같은 본문을 페이지로 렌더
 * - 헤더/푸터는 SiteChrome 이 이 경로에서 생략한다
 */
export default async function TinfoViewPage({ searchParams }: { searchParams: Promise<{ tinfoseq?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.tinfoseq) ? sp.tinfoseq[0] : sp.tinfoseq;
  const seq = (raw ?? "").trim();

  const t = (tinfoJson as Record<string, Tinfo>)[seq];
  if (!t || !t.model) {
    return <div className="w-[960px] self-start p-[40px] font-sans text-[13px] text-muted max-pc:w-full">해당 제품 정보를 찾을 수 없습니다.</div>;
  }
  const note = (notesJson as Record<string, TireNote>)[seq];

  return (
    <div className="w-[960px] self-start max-pc:w-full">
      <TireDetailContent data={toTireDetail(t, note)} />
    </div>
  );
}
