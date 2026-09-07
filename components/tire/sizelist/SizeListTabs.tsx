import Link from "next/link";
import { buildSizeListHref, type SizeListQuery } from "@/lib/sizelistQuery";

/* 타이어 구분 탭 (seltireg 값) */
const TABS: { g: string; label: string }[] = [
  { g: "all", label: "전체" },
  { g: "main", label: "베스트" },
  { g: "10", label: "프리미엄" },
  { g: "15", label: "고급" },
  { g: "20", label: "중급" },
  { g: "25", label: "실속" },
  { g: "snow", label: "스노우" },
];

type Props = { query: SizeListQuery; total: number };

/**
 * 구분 탭 (텍스트 탭, 현재 탭은 2px 잉크색 밑줄) + 우측 "총 N개"
 * 탭 변경 시 제조사 전체로 리셋, 페이지 리셋 (정렬은 유지)
 */
export default function SizeListTabs({ query, total }: Props) {
  const href = (g: string) => buildSizeListHref({ ...query, seltireg: g, brandop: [], spage: 1, lpage: 1 });

  return (
    <div className="flex items-end justify-between border-b border-line max-pc:flex-col max-pc:items-stretch">
      <ul className="flex max-pc:overflow-x-auto max-pc:[scrollbar-width:none]">
        {TABS.map((t) => {
          const active = query.seltireg === t.g;
          return (
            <li key={t.g}>
              <Link
                href={href(t.g)}
                className={`relative block px-[16px] pb-[12px] pt-[4px] text-[14px] whitespace-nowrap hover:!no-underline max-pc:px-[12px] ${
                  active ? "font-bold !text-ink" : "!text-muted hover:!text-ink"
                }`}
              >
                {t.label}
                {active && <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-ink" />}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="pb-[12px] text-[12px] text-muted max-pc:pt-[8px]" style={{ fontFamily: "var(--font-num)" }}>
        총 <b className="text-ink">{total}</b>개
      </p>
    </div>
  );
}
