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

/* 이용 절차 5단계 */
const STEPS: { icon: keyof typeof ICONS; title: string; desc: string }[] = [
  { icon: "search", title: "타이어 검색", desc: "차종 또는 사이즈로 검색" },
  { icon: "calendar", title: "예약", desc: "수량 선택 후 예약" },
  { icon: "phone", title: "해피콜", desc: "예약 확인 후 연락" },
  { icon: "store", title: "매장 방문", desc: "예약일에 매장 방문" },
  { icon: "card", title: "장착 · 결제", desc: "장착 완료 후 매장에서 결제" },
];

/**
 * 이용 절차 섹션 — 아이콘 카드 5개 (좌측 정렬, 원형 배경 안에 선 아이콘, 우상단 번호)
 * - 카드 사이 얇은 선으로 흐름을 잇는다
 * - 모바일: 2열 + 마지막 1개 전체폭
 */
export default function OrderSteps() {
  return (
    <section className="w-full font-sans">
      <div className="mb-[16px] flex items-end justify-between">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">이용 절차</h2>
        </div>
        <p className="text-[12px] text-muted max-pc:hidden">검색부터 장착까지 다섯 단계</p>
      </div>
      <ol className="grid grid-cols-5 gap-[10px] max-pc:grid-cols-2">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="group relative border border-line bg-white p-[18px] transition-colors hover:border-ink max-pc:last:col-span-2"
          >
            <span className="eyebrow absolute right-[14px] top-[14px] !text-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-surface text-ink transition-colors group-hover:bg-ink group-hover:text-white">
              {ICONS[s.icon]}
            </span>
            <p className="mt-[14px] text-[15px] font-semibold tracking-[-0.01em] text-ink">{s.title}</p>
            <p className="mt-[4px] whitespace-nowrap text-[11.5px] leading-[18px] tracking-[-0.02em] text-muted">{s.desc}</p>
            {/* 다음 단계로 잇는 짧은 선 (카드 사이 간격 위에) */}
            {i < STEPS.length - 1 && <span className="absolute right-[-11px] top-[49px] h-px w-[12px] bg-line max-pc:hidden" />}
          </li>
        ))}
      </ol>
    </section>
  );
}
