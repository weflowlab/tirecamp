"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openTireInfo } from "@/components/tire/tireInfoWin";
import type { SizeBlock, TireItem } from "@/lib/sizelistQuery";

const NUM = { fontFamily: "var(--font-num)" } as const;

/* 천단위 콤마 */
function money(n: number): string {
  return n.toLocaleString("ko-KR");
}

type Props = { tire: TireItem };

/**
 * 타이어 결과 카드 1개 — [이미지 | 브랜드·모델·설명·사이즈별 가격/수량 | 합계·예약]
 *  - bestSection: 베스트 섹션 카드 (얇은 잉크색 테두리 + BEST 라벨)
 *  - 이미지/이름 클릭 → 상세 팝업, 수량 변경 → 총수량/총금액 갱신
 *  - 예약 버튼 → 수량 검증 후 문의 폼으로 이동 (타이어 · 사이즈 · 수량 미리 채움)
 */
export default function TireCard({ tire }: Props) {
  const best = tire.bestSection;
  const [qty1, setQty1] = useState(tire.front.defaultQty);
  const [qty2, setQty2] = useState(tire.rear ? tire.rear.defaultQty : 0);
  const router = useRouter();

  const totalCnt = qty1 + (tire.rear ? qty2 : 0);
  const totalCard = tire.front.salePrice * qty1 + (tire.rear ? tire.rear.salePrice * qty2 : 0);

  function openInfo(e: React.MouseEvent) {
    e.preventDefault();
    openTireInfo(tire.tinfoseq);
  }

  function bookingSave() {
    if (!tire.rear) {
      if (qty1 < 1) {
        alert("구매하실 수량을 선택하세요.");
        return;
      }
    } else if (qty1 < 1 && qty2 < 1) {
      alert("앞쪽 또는 뒤쪽타이어의 구매하실 수량을 선택하세요.");
      return;
    }
    /* 문의 폼으로 이동 — 타이어명 · 사이즈 · 수량을 미리 채운다 (교체 예약 유형) */
    const sizes = tire.rear ? `앞 ${tire.front.size} ${qty1}개 · 뒤 ${tire.rear.size} ${qty2}개` : `${tire.front.size} ${qty1}개`;
    const q = new URLSearchParams({ tire: `${tire.brand} ${tire.model}`, size: sizes, type: "교체 예약" });
    router.push(`/contact?${q.toString()}`);
  }

  /* 사이즈 1줄: 사이즈 · 속도등급 | 시중가/할인가 | 수량 */
  const sizeRow = (b: SizeBlock, head: string | null, qty: number, setQty: (n: number) => void) => (
    <div className="border-t border-line pt-[12px] mt-[12px]">
      {head && <p className="eyebrow mb-[6px]">{head}</p>}
      {/* 모든 항목을 32px 높이 상자 안에서 세로 가운데 정렬 (select 대신 − / + 스테퍼라 모바일 16px 강제 규칙 영향 없음) */}
      <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[8px]">
        <div className="flex h-[32px] min-w-[130px] items-center">
          <span className="text-[16px] font-semibold leading-none text-ink" style={NUM}>
            {b.size}
          </span>
          {b.speedGrade && (
            <span className="ml-[6px] text-[11px] leading-none text-muted" title={b.speedTitle} style={NUM}>
              {b.speedGrade}
            </span>
          )}
        </div>
        <div className="flex h-[32px] items-baseline gap-[10px] pt-[7px]">
          <span className="text-[12px] leading-none text-faint line-through" style={NUM}>
            {money(b.marketPrice)}
          </span>
          <span className="text-[17px] font-bold leading-none text-ink" style={NUM}>
            {money(b.salePrice)}
            <span className="ml-[2px] text-[12px] font-normal text-graphite">원</span>
          </span>
          {b.discountText && <span className="text-[11px] leading-none text-muted">{b.discountText.replace(/^↓/, "")}</span>}
        </div>
        {/* 수량: − 숫자 + 스테퍼 (0~8) */}
        <div className="ml-auto flex h-[32px] items-center gap-[8px] text-[12px] text-muted max-pc:ml-0">
          수량
          <div className="flex h-[32px] items-center border border-line">
            <button
              type="button"
              aria-label="수량 줄이기"
              onClick={() => setQty(Math.max(0, qty - 1))}
              className="flex h-full w-[30px] items-center justify-center text-graphite hover:bg-surface hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 6h8" /></svg>
            </button>
            <span className="w-[28px] text-center text-[14px] font-semibold leading-none text-ink" style={NUM}>
              {qty}
            </span>
            <button
              type="button"
              aria-label="수량 늘리기"
              onClick={() => setQty(Math.min(8, qty + 1))}
              className="flex h-full w-[30px] items-center justify-center text-graphite hover:bg-surface hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 6h8M6 2v8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <article className={`mt-[16px] grid grid-cols-[180px_1fr_200px] gap-[24px] p-[24px] max-pc:grid-cols-1 max-pc:gap-[16px] max-pc:p-[16px] ${best ? "border border-ink" : "border border-line"}`}>
      {/* 좌: 이미지 */}
      <div className="relative flex items-start justify-center">
        {best && <span className="eyebrow absolute left-0 top-0 !text-ink">Best</span>}
        <a href="#" onClick={openInfo} className="block pt-[16px]">
          <img src={tire.imageUrl} alt={`${tire.brand} ${tire.model}`} width={140} className="block" />
        </a>
      </div>

      {/* 중: 브랜드/모델, 설명, 사이즈별 가격 */}
      <div className="min-w-0">
        <a href="#" onClick={openInfo} className="inline-block hover:!no-underline">
          <span className="text-[12px] tracking-[0.04em] !text-muted">{tire.brand}</span>
          <span className="mt-[2px] block text-[19px] font-bold tracking-[-0.01em] !text-ink">{tire.model}</span>
        </a>
        {tire.desc && <p className="mt-[8px] text-[13px] leading-[21px] text-graphite">{tire.desc}</p>}
        {tire.comment && <p className="mt-[6px] text-[12px] text-graphite">{tire.comment}</p>}

        {sizeRow(tire.front, tire.rear ? "Front · 앞" : null, qty1, setQty1)}
        {tire.rear && sizeRow(tire.rear, "Rear · 뒤", qty2, setQty2)}
      </div>

      {/* 우: 합계 + 예약 */}
      <div className="flex flex-col justify-between border-l border-line pl-[24px] max-pc:border-l-0 max-pc:border-t max-pc:pl-0 max-pc:pt-[16px]">
        <div>
          <p className="eyebrow">Total</p>
          <p className="mt-[6px] flex items-baseline justify-between text-[13px] text-graphite">
            <span>총수량</span>
            <span className="text-ink" style={NUM}>
              <b className="text-[16px]">{totalCnt}</b>개
            </span>
          </p>
          <p className="mt-[4px] flex items-baseline justify-between text-[13px] text-graphite">
            <span>총금액</span>
            <span className="text-ink" style={NUM}>
              <b className="text-[20px]">{money(totalCard)}</b>원
            </span>
          </p>
        </div>
        <div className="mt-[16px]">
          <button type="button" onClick={bookingSave} className="btn-fill w-full">
            예약하기
          </button>
          <p className="mt-[8px] text-center text-[11px] text-muted">택배 문의는 전화로 주세요</p>
        </div>
      </div>
    </article>
  );
}
