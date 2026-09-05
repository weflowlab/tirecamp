"use client";

import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListFilter, TireListItem } from "@/lib/tprodintro";
import { PER_PAGE, filterItems } from "@/lib/tprodintro";
import FilterBox from "./FilterBox";
import TireCard from "./TireCard";
import Paginator from "./Paginator";

type Props = {
  items: TireListItem[];
  /** seq → 모델명 (브랜드명 입력란 검색용, data/tinfo.json 에서) */
  models: Record<string, string>;
};

/**
 * 타이어소개 본문 (원본 form name="frm" 전체)
 * - 원본은 hidden(spage/lpage/htypecode/hlevelcode)+체크박스를 POST 로 다시 불러오지만,
 *   여기서는 정적 JSON 을 클라이언트에서 거르고 상태를 URL 쿼리(?brand=10,14&type=10&level=&q=&page=2)에 반영한다.
 */
export default function TprodIntro(props: Props) {
  return (
    // useSearchParams 는 Suspense 경계가 필요
    <Suspense fallback={null}>
      <TprodIntroInner {...props} />
    </Suspense>
  );
}

function TprodIntroInner({ items, models }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  /* URL 쿼리 → 필터 상태 */
  const filter: ListFilter = useMemo(
    () => ({
      brands: (sp.get("brand") ?? "").split(",").filter(Boolean),
      type: sp.get("type") ?? "",
      level: sp.get("level") ?? "",
      q: sp.get("q") ?? "",
      page: Math.max(1, Number(sp.get("page") ?? "1") || 1),
    }),
    [sp],
  );

  /* 필터 상태 → URL 반영 (원본 frm.submit() 에 해당) */
  const apply = useCallback(
    (next: Partial<ListFilter>) => {
      const f = { ...filter, ...next };
      const params = new URLSearchParams();
      if (f.brands.length) params.set("brand", f.brands.join(","));
      if (f.type) params.set("type", f.type);
      if (f.level) params.set("level", f.level);
      if (f.q) params.set("q", f.q);
      if (f.page > 1) params.set("page", String(f.page));
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filter, pathname, router],
  );

  /* 필터 변경 = 원본 beginpost() (findfristchk=pagereset → 1페이지로) */
  const reset = (next: Partial<ListFilter>) => apply({ ...next, page: 1 });

  /* 원본 selbrand(c): 전체 클릭 시 나머지 해제, 브랜드 클릭 시 전체 해제 */
  const selBrand = (code: string) => {
    if (code === "all") {
      reset({ brands: [] });
      return;
    }
    const set = new Set(filter.brands);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    reset({ brands: [...set] });
  };

  const filtered = useMemo(() => filterItems(items, filter, models), [items, filter, models]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(filter.page, totalPages);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* 4열로 나눈다 (원본 <TR> 마다 4개 <TD>) */
  const rows: TireListItem[][] = [];
  for (let i = 0; i < pageItems.length; i += 4) rows.push(pageItems.slice(i, i + 4));

  return (
    <div className="w-full flex flex-col items-center">
      {/* 타이틀 이미지 행 (896 x 55) — 모바일은 타이틀만 */}
      <table className="w-[896px] m-stack">
        <tbody>
          <tr>
            <td className="h-[55px] w-[317px] text-center max-pc:py-[10px]">
              <img src="/images/tbrandintro/introtitle.gif" width={317} height={31} alt="타이어소개" />
            </td>
            <td className="h-[55px] w-[328px] max-pc:hidden">　</td>
            <td className="h-[55px] w-[251px] text-center max-pc:hidden">　</td>
          </tr>
        </tbody>
      </table>
      {/* 연한 회색 5px 바 + 12px 여백 */}
      <table className="w-[896px] m-fluid">
        <tbody>
          <tr>
            <td className="h-[5px] w-[896px] bg-[#F2F2F2]"></td>
          </tr>
          <tr>
            <td className="h-[12px] w-[896px]"></td>
          </tr>
        </tbody>
      </table>

      {/* 제조사별 / 타입별 / 등급별 필터 박스 */}
      <FilterBox filter={filter} onBrand={selBrand} onType={(c) => reset({ type: c })} onLevel={(c) => reset({ level: c })} />

      {/* 5px + 5px 여백 */}
      <div className="h-[10px] w-[286px]"></div>

      {/* 상품수/페이지 + 브랜드명 검색 (896 x 39) — 모바일(.m-wrap): 상품수 왼쪽, 브랜드명 검색 오른쪽 */}
      <table className="w-[896px] m-wrap">
        <tbody>
          <tr className="max-pc:gap-y-[6px] max-pc:py-[6px]">
            <td className="h-[39px] w-[216px] text-center">
              <span className="text-[8pt] text-[#A4A4A4]">
                상품수 : {filtered.length}개,&nbsp; 페이지 : {page}/{totalPages}
              </span>
            </td>
            <td className="h-[39px] w-[218px] text-center max-pc:hidden">　</td>
            <td className="h-[39px] w-[346px] text-right max-pc:ml-auto">
              <b>브랜드명&nbsp;&nbsp; </b>
            </td>
            <td className="h-[39px] w-[155px] text-left">
              {/* 원본 findbrandname: Enter 로 submit (entersubmit → pagereset). 실제 매칭은 모델명 부분일치 */}
              <input
                type="text"
                name="findbrandname"
                size={15}
                defaultValue={filter.q}
                key={filter.q}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    reset({ q: (e.target as HTMLInputElement).value });
                  }
                }}
                className="border-2 border-[#D5D5D5] text-[10pt] px-[2px] py-[1px] outline-none max-pc:w-[130px]"
                style={{ fontFamily: "굴림, 'Nanum Gothic', sans-serif" }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="h-[5px] w-[167px]"></div>

      {/* 카드 그리드 (896폭, 4열, 각 셀 224 x 364) — 모바일(.m-wrap): 2열 */}
      <table className="w-[896px] m-wrap">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((it) => (
                <TireCard key={it.seq} item={it} />
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="h-[364px] w-[896px] text-center align-top">　</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지 번호 (원본 MovePage(spage,lpage)) */}
      <Paginator page={page} totalPages={totalPages} onMove={(p) => apply({ page: p })} />
    </div>
  );
}
