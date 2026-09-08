"use client";

import type { TireListItem } from "@/lib/tprodintro";
import { openTireInfo } from "@/components/tire/tireInfoWin";

/**
 * 타이어 카드 한 장 — 이미지 / 브랜드 로고(흑백) / 타입·등급 / 가격대
 * 클릭 → 상세 팝업
 */
export default function TireCard({ item }: { item: TireListItem }) {
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    openTireInfo(item.seq);
  };

  return (
    <li className="group border border-line transition-colors hover:border-ink">
      <a href={`/product/tinfo/view?tinfoseq=${item.seq}`} onClick={open} className="block hover:!no-underline">
        <div className="flex h-[220px] items-center justify-center overflow-hidden bg-white p-[12px] max-pc:h-[170px]">
          <img src={item.image} alt="" className="max-h-full w-auto transition-transform duration-500 group-hover:scale-[1.04]" />
        </div>
        <div className="border-t border-line px-[14px] py-[12px]">
          <img src={`/images/companylogo/${item.brandCode}.webp`} alt={item.brandName} className="img-fixed h-[18px] w-auto" />
          <p className="mt-[8px] text-[12px] text-muted">
            {item.typeLabel} · {item.levelLabel}
          </p>
          <p className="mt-[2px] text-[13px] font-semibold text-ink" style={{ fontFamily: "var(--font-num)" }}>
            {item.price}
            <span className="ml-[2px] text-[11px] font-normal text-graphite">원</span>
          </p>
        </div>
      </a>
    </li>
  );
}
