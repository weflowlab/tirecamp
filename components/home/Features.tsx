import Link from "next/link";
import { HOME_ICONS } from "./icons";
import { SITE } from "@/lib/site";

/** 섹션 제목 줄 — 제목 + (선택) 오른쪽 보조 문구 */
function SectionHead({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-[16px] flex items-end justify-between">
      <h2 className="text-[21px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
      {note && <p className="text-[13px] text-muted max-pc:hidden">{note}</p>}
    </div>
  );
}

/* 타이어캠프의 장점 6 */
const STRENGTHS: { icon: string; title: string; desc: string }[] = [
  { icon: "tag", title: "합리적 가격", desc: "박리다매 판매" },
  { icon: "warehouse", title: "재고 대량 보유", desc: "빠른 출고 가능" },
  { icon: "truck", title: "빠른 출고 · 장착", desc: "당일 장착 상담" },
  { icon: "compare", title: "브랜드 비교 견적", desc: "전 브랜드 비교 가능" },
  { icon: "ruler", title: "다양한 규격", desc: "사이즈 다양" },
  { icon: "stack", title: "신품 · 이월 · 중고", desc: "상황별 선택 가능" },
];

/* 용도에 맞는 타이어 찾기 5 — 설명은 줄바꿈 없이 한 문장, 칸 폭에 맞춰 접히게 둔다 */
const PURPOSES: { icon: string; title: string; desc: string; href: string }[] = [
  { icon: "tireNew", title: "신품 타이어", desc: "최신 생산 타이어", href: "/product/tire/searchbysize" },
  { icon: "tireCarry", title: "이월 타이어", desc: "출고 후 1~2년 이내의 타이어", href: "/product/tire/searchbysize" },
  { icon: "tireUsed", title: "중고 타이어", desc: "꼼꼼히 선별한 중고 타이어", href: "/product/used" },
  { icon: "suv", title: "SUV / 4x4 타이어", desc: "SUV 및 4x4 차량에 적합한 전용 타이어", href: "/product/tprodintro?type=15" },
  { icon: "calendar", title: "장착 예약", desc: "원하는 날짜와 시간에 장착 예약 신청하세요", href: "/contact" },
];

/** 타이어캠프의 장점 — 6칸, 얇은 세로선으로 구분 */
export function Strengths() {
  return (
    <section className="w-full font-sans">
      <SectionHead title={`${SITE.name}의 장점`} />
      <ul className="grid grid-cols-6 border-y border-line max-pc:grid-cols-3">
        {STRENGTHS.map((s, i) => (
          <li key={s.title} className={`flex flex-col items-center px-[8px] py-[28px] text-center max-pc:px-[2px] max-pc:py-[18px] ${i < 5 ? "border-r border-line" : ""} max-pc:[&:nth-child(3)]:border-r-0 max-pc:[&:nth-child(-n+3)]:border-b max-pc:[&:nth-child(-n+3)]:border-line`}>
            <span className="flex h-[96px] items-center text-ink max-pc:[&>svg]:h-[72px] max-pc:[&>svg]:w-[72px]">{HOME_ICONS[s.icon]}</span>
            <p className="mt-[14px] whitespace-nowrap text-[17px] font-bold tracking-[-0.02em] text-ink max-pc:mt-[10px] max-pc:text-[13.5px] max-pc:tracking-[-0.04em]">{s.title}</p>
            <p className="mt-[4px] whitespace-nowrap text-[14px] text-muted max-pc:text-[11.5px] max-pc:tracking-[-0.03em]">{s.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 용도에 맞는 타이어 찾기 — 카드 6장 (링크) */
export function Purposes() {
  return (
    <section className="w-full font-sans">
      <SectionHead title="용도에 맞는 타이어 찾기" />
      {/* 모바일: 가로 스와이프, 카드 1.4장 보임 (스냅) */}
      <ul className="grid grid-cols-5 gap-[10px] max-pc:flex max-pc:snap-x max-pc:snap-mandatory max-pc:overflow-x-auto max-pc:pb-[4px] max-pc:[scrollbar-width:none]">
        {PURPOSES.map((p) => (
          <li key={p.title} className="max-pc:w-[68%] max-pc:shrink-0 max-pc:snap-start">
            {/* 아이콘·글자를 키우고 테두리를 굵게 — 빈 여백을 줄인다 */}
            <Link href={p.href} className="group flex h-full flex-col items-center border-2 border-line px-[12px] py-[20px] text-center transition-colors hover:border-ink hover:!no-underline">
              {/* 아이콘 칸 높이도 모바일에서 같이 줄여야 아이콘 위아래 빈 공간이 안 남는다 */}
              <span className="flex h-[112px] items-center !text-ink transition-transform group-hover:scale-[1.06] [&>svg]:h-[112px] [&>svg]:w-[112px] max-pc:h-[90px] max-pc:[&>svg]:h-[90px] max-pc:[&>svg]:w-[90px]">
                {HOME_ICONS[p.icon]}
              </span>
              <p className="mt-[12px] text-[19px] font-bold tracking-[-0.02em] !text-ink max-pc:mt-[10px] max-pc:text-[17px]">{p.title}</p>
              <p className="mt-[6px] text-[14px] leading-[20px] !text-muted max-pc:text-[14px]">{p.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
