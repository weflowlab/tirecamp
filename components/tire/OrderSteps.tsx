import type { ReactNode } from "react";

/* 선 아이콘 (stroke 1.5) — 이용 절차 전용 심플 아이콘 */
const ICON = { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, ReactNode> = {
  search: (
    <svg {...ICON}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  calendar: (
    <svg {...ICON}>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="m9.5 15.5 1.8 1.8 3.7-3.8" />
    </svg>
  ),
  phone: (
    <svg {...ICON}>
      <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1.5 1.5 0 0 1-1.5 1.5C10.5 20.5 3.5 13.5 3.5 5.5A1.5 1.5 0 0 1 5 4Z" />
    </svg>
  ),
  store: (
    <svg {...ICON}>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5c0 1.4 1.1 2.5 2.5 2.5S9 10.9 9 9.5c0 1.4 1.1 2.5 2.5 2.5S14 10.9 14 9.5c0 1.4 1.1 2.5 2.5 2.5S20 10.9 20 9.5" />
      <path d="M5.5 12v8h13v-8M10 20v-5h4v5" />
    </svg>
  ),
  card: (
    <svg {...ICON}>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M3 10h18M7 14h3" />
    </svg>
  ),
};

/* 이용 절차 5단계 (한 줄로 줄이면서 단계별 설명은 뺐다) */
const STEPS: { icon: keyof typeof ICONS; title: string }[] = [
  { icon: "search", title: "타이어 검색" },
  { icon: "calendar", title: "예약" },
  { icon: "phone", title: "해피콜" },
  { icon: "store", title: "매장 방문" },
  { icon: "card", title: "장착 · 결제" },
];

/**
 * 이용 절차 섹션 — 박스 하나 안에 [아이콘 + 단계 이름]을 화살표로 이은 한 줄
 * (아주 중요한 정보는 아니어서 자리를 최소로 쓴다. 단계별 설명 문구는 두지 않는다)
 * - 모바일: 줄을 바꾸면 다시 높아지므로 가로로 밀어서 본다
 */
export default function OrderSteps() {
  return (
    <section className="w-full font-sans">
      <h2 className="mb-[10px] text-[21px] font-bold tracking-[-0.02em] text-ink">이용 절차</h2>
      <ol className="flex items-center justify-center border border-line bg-white px-[20px] py-[14px] max-pc:justify-start max-pc:overflow-x-auto max-pc:px-[12px] max-pc:[scrollbar-width:none]">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex shrink-0 items-center">
            <span className="flex items-center gap-[8px] whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em] text-ink max-pc:gap-[5px] max-pc:text-[13px]">
              <span className="[&>svg]:h-[24px] [&>svg]:w-[24px] max-pc:[&>svg]:h-[20px] max-pc:[&>svg]:w-[20px]">{ICONS[s.icon]}</span>
              {s.title}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="mx-[14px] text-[15px] text-faint max-pc:mx-[8px]">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
