"use client";

import { useState } from "react";
import { openTireInfo } from "@/components/tire/tireInfoWin";
import type { SizeBlock, TireItem } from "@/lib/sizelistQuery";
import { SITE } from "@/lib/site";

const NUM = { fontFamily: "var(--font-num)" } as const;

/* 천단위 콤마 */
function money(n: number): string {
  return n.toLocaleString("ko-KR");
}

/* 수량 select 0~8 */
const QTY_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

type Props = { tire: TireItem };

/**
 * 타이어 결과 카드 1개 — [이미지 | 브랜드·모델·설명·사이즈별 가격/수량 | 합계·예약]
 *  - bestSection: 베스트 섹션 카드 (얇은 잉크색 테두리 + BEST 라벨)
 *  - 이미지/이름 클릭 → 상세 팝업, 수량 변경 → 총수량/총금액 갱신
 *  - 예약 버튼 → 수량 검증/confirm 후 전화 안내 (온라인 예약은 미구현)
 */
export default function TireCard({ tire }: Props) {
  const best = tire.bestSection;
  const [qty1, setQty1] = useState(tire.front.defaultQty);
  const [qty2, setQty2] = useState(tire.rear ? tire.rear.defaultQty : 0);

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
    if (confirm("구매수량을 확인 하셨나요?\n\n예약 하시겠습니까?")) {
      alert(`온라인 예약 접수는 준비 중입니다.\n예약 및 택배 문의는 전화 ${SITE.phone} 로 연락 주세요.`);
    }
  }

  /* 사이즈 1줄: 사이즈 · 속도등급 | 시중가/할인가 | 수량 */
  const sizeRow = (b: SizeBlock, head: string | null, qty: number, setQty: (n: number) => void) => (
    <div className="border-t border-line pt-[12px] mt-[12px]">
      {head && <p className="eyebrow mb-[6px]">{head}</p>}
      <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[8px]">
        <div className="min-w-[130px]">
          <span className="text-[16px] font-semibold text-ink" style={NUM}>
            {b.size}
          </span>
          {b.speedGrade && (
            <span className="ml-[6px] text-[11px] text-muted" title={b.speedTitle} style={NUM}>
              {b.speedGrade}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-[10px]">
          <span className="text-[12px] text-faint line-through" style={NUM}>
            {money(b.marketPrice)}
          </span>
          <span className="text-[17px] font-bold text-ink" style={NUM}>
            {money(b.salePrice)}
            <span className="ml-[2px] text-[12px] font-normal text-graphite">원</span>
          </span>
          {b.discountText && <span className="text-[11px] text-muted">{b.discountText.replace(/^↓/, "")}</span>}
        </div>
        <label className="ml-auto flex items-center gap-[6px] text-[12px] text-muted max-pc:ml-0">
          수량
          <select
            name={head?.startsWith("Rear") ? "selordercnt2" : "selordercnt1"}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10))}
            className="field !h-[32px] !w-[60px] !px-[6px] !text-[13px]"
          >
            {QTY_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
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
        {tire.strength && (
          <p className="mt-[6px] text-[12px] text-muted">
            주장점 <span className="text-ink">{tire.strength}</span>
          </p>
        )}
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
