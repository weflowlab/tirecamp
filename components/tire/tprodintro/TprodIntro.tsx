"use client";

import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListFilter, TireListItem } from "@/lib/tprodintro";
import { PER_PAGE, filterItems } from "@/lib/tprodintro";
import PageTitle from "@/components/layout/PageTitle";
import FilterBox from "./FilterBox";
import TireCard from "./TireCard";
import Paginator from "./Paginator";

type Props = {
  items: TireListItem[];
  /** seq → 모델명 (브랜드명 입력란 검색용, data/tinfo.json 에서) */
  models: Record<string, string>;
};

/**
 * 타이어소개 본문
 * - 정적 JSON 을 클라이언트에서 거르고 상태를 URL 쿼리(?brand=10,14&type=10&level=&q=&page=2)에 반영
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

  /* 필터 상태 → URL 반영 */
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

  /* 필터 변경 = 1페이지로 */
  const reset = (next: Partial<ListFilter>) => apply({ ...next, page: 1 });

  /* 전체 클릭 시 나머지 해제, 브랜드 클릭 시 전체 해제 */
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

  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Tires" title="타이어소개" sub="취급하는 타이어를 제조사·타입·등급별로 살펴보세요. 이미지를 누르면 상세 정보가 열립니다." />

      {/* 제조사별 / 타입별 / 등급별 필터 */}
      <FilterBox filter={filter} onBrand={selBrand} onType={(c) => reset({ type: c })} onLevel={(c) => reset({ level: c })} />

      {/* 상품수/페이지 + 모델명 검색 */}
      <div className="mt-[28px] flex items-center justify-between gap-[12px] border-b border-line pb-[12px] max-pc:flex-col max-pc:items-stretch">
        <p className="text-[12px] text-muted" style={{ fontFamily: "var(--font-num)" }}>
          {filtered.length} tires · {page}/{totalPages}
        </p>
        <input
          type="text"
          name="findbrandname"
          defaultValue={filter.q}
          key={filter.q}
          placeholder="모델명 검색 후 Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              reset({ q: (e.target as HTMLInputElement).value });
            }
          }}
          className="field !h-[36px] !w-[220px] !text-[13px] max-pc:!w-full"
        />
      </div>

      {/* 카드 그리드 (4열 / 모바일 2열) */}
      {pageItems.length === 0 ? (
        <p className="border-b border-line py-[48px] text-center text-[13px] text-muted">조건에 맞는 타이어가 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-4 gap-[16px] pt-[20px] max-pc:grid-cols-2 max-pc:gap-[10px]">
          {pageItems.map((it) => (
            <TireCard key={it.seq} item={it} />
          ))}
        </ul>
      )}

      <Paginator page={page} totalPages={totalPages} onMove={(p) => apply({ page: p })} />
    </div>
  );
}
