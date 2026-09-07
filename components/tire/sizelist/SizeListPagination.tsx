import Link from "next/link";
import { buildSizeListHref, type PageLink, type SizeListQuery } from "@/lib/sizelistQuery";

type Props = { query: SizeListQuery; pages: PageLink[] };

/**
 * 하단 페이지 번호 — 현재 페이지는 잉크색 굵게, 나머지는 회색
 * (페이지가 2개 이상일 때만 표시)
 */
export default function SizeListPagination({ query, pages }: Props) {
  if (pages.length === 0) return null;
  return (
    <div className="mt-[32px] flex justify-center gap-[4px]" style={{ fontFamily: "var(--font-num)" }}>
      {pages.map((p) => (
        <Link
          key={`${p.spage}-${p.lpage}`}
          href={buildSizeListHref({ ...query, spage: p.spage, lpage: p.lpage })}
          className={`flex h-[34px] min-w-[34px] items-center justify-center px-[8px] text-[13px] hover:!no-underline ${
            p.current ? "border-b-2 border-ink font-bold !text-ink" : "!text-muted hover:!text-ink"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}
