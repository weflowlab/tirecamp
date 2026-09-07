import type { Metadata } from "next";
import { getSizeList, parseSizeListQuery } from "@/lib/sizelist";
import { formatSize } from "@/lib/sizelistQuery";
import PageTitle from "@/components/layout/PageTitle";
import SizeListFilter from "@/components/tire/sizelist/SizeListFilter";
import SizeListTabs from "@/components/tire/sizelist/SizeListTabs";
import TireCard from "@/components/tire/sizelist/TireCard";
import SizeListPagination from "@/components/tire/sizelist/SizeListPagination";
import { pageTitle } from "@/lib/site";

/* <title>: "2254518 타이어가격 | 타이어캠프 - …" */
export async function generateMetadata({ searchParams }: PageProps<"/product/tire/sizelist">): Promise<Metadata> {
  const q = parseSizeListQuery(await searchParams);
  return { title: pageTitle(`${q.ftsize} 타이어가격`) };
}

/**
 * 타이어 사이즈 검색 결과 페이지 (/product/tire/sizelist)
 * URL query(find_ftsize, find_rtsize, seltireg, sorttireop, brandop, spage, lpage) 가 검색 상태.
 * 서버 컴포넌트: query → 정적 데이터 조회(lib/sizelist.ts, data/sizelist/*.json) → 카드 목록 렌더.
 */
export default async function SizeListPage({ searchParams }: PageProps<"/product/tire/sizelist">) {
  const query = parseSizeListQuery(await searchParams);
  const result = await getSizeList(query);
  const sizeLabel =
    query.rtsize && query.rtsize !== query.ftsize ? `${formatSize(query.ftsize)} · 뒤 ${formatSize(query.rtsize)}` : formatSize(query.ftsize);

  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Tire List" title={sizeLabel} sub="선택한 사이즈에 맞는 타이어입니다. 정렬과 제조사를 바꿔 비교해 보세요." />

      {/* 사이즈 재검색 / 정렬 / 제조사 */}
      <SizeListFilter query={query} />

      {/* 구분 탭 + 결과 카드 목록 */}
      <div className="mt-[36px]">
        <SizeListTabs query={query} total={result.total} />
        {result.tires.length === 0 && (
          <p className="border-b border-line py-[48px] text-center text-[13px] text-muted">조건에 맞는 타이어가 없습니다. 제조사나 구분을 바꿔 보세요.</p>
        )}
        {result.tires.map((t, i) => (
          <TireCard key={`${t.tinfoseq}-${i}`} tire={t} />
        ))}
      </div>

      <SizeListPagination query={query} pages={result.pages} />
    </div>
  );
}
