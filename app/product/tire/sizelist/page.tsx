import type { Metadata } from "next";
import { getSizeList, parseSizeListQuery } from "@/lib/sizelist";
import Link from "next/link";
import { buildSizeListHref, formatSize } from "@/lib/sizelistQuery";
import tinfoJson from "@/data/tinfo.json";
import type { Tinfo } from "@/lib/tinfo";
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

  /* 타이어소개에서 넘어온 "선택한 타이어" — 결과에 있으면 맨 위에 강조, 없으면 안내 */
  const picked = query.tinfo ? (tinfoJson as Record<string, Tinfo>)[query.tinfo] : undefined;
  const pickedTires = picked ? result.tires.filter((t) => t.tinfoseq === query.tinfo) : [];
  const otherTires = picked ? result.tires.filter((t) => t.tinfoseq !== query.tinfo) : result.tires;
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

        {picked && (
          <div className="mt-[16px]">
            <div className="flex items-center justify-between gap-[12px]">
              <p className="eyebrow">Selected · {picked.brandName} {picked.model}</p>
              <Link href={buildSizeListHref({ ...query, tinfo: undefined })} className="text-[12px] !text-muted underline underline-offset-4 hover:!text-ink">
                선택 해제
              </Link>
            </div>
            {pickedTires.length === 0 && (
              <p className="mt-[8px] border border-dashed border-line px-[18px] py-[16px] text-[13px] text-muted">
                {picked.brandName} {picked.model}는 이 사이즈에 가격 정보가 없습니다. 아래 다른 타이어를 확인하시거나 문의해 주세요.
              </p>
            )}
            {pickedTires.map((t, i) => (
              <TireCard key={`picked-${t.tinfoseq}-${i}`} tire={{ ...t, bestSection: true }} />
            ))}
            {otherTires.length > 0 && <p className="eyebrow mt-[28px]">Other tires</p>}
          </div>
        )}

        {result.tires.length === 0 && (
          <p className="border-b border-line py-[48px] text-center text-[13px] text-muted">조건에 맞는 타이어가 없습니다. 제조사나 구분을 바꿔 보세요.</p>
        )}
        {otherTires.map((t, i) => (
          <TireCard key={`${t.tinfoseq}-${i}`} tire={t} />
        ))}
      </div>

      <SizeListPagination query={query} pages={result.pages} />
    </div>
  );
}
