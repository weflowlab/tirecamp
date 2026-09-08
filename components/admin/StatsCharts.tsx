import type { Bucket } from "@/lib/analytics";
import ScrollToEnd from "./ScrollToEnd";
import { NUM } from "./ui";

/*
 * 방문자 통계 화면 조각 — 라이브러리 없이 div 로 그리는 단색(잉크) 막대
 * - 숫자 타일(아이콘 · 큰 숫자 · 설명) / 요약 배너 / 아이콘 카드 / 가로 막대 목록 / 날짜별 · 시간대 세로 막대
 * - 한 계열뿐이라 범례는 두지 않고, 값은 막대 옆·위에 직접 적는다
 */

/* ---------- 아이콘 (16~20px 선 아이콘) ---------- */
const I = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const Icons = {
  users: (
    <svg {...I} width="20" height="20">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  eye: (
    <svg {...I} width="20" height="20">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  bounce: (
    <svg {...I} width="20" height="20">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
  clock: (
    <svg {...I} width="20" height="20">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  trend: (
    <svg {...I} width="20" height="20">
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
  login: (
    <svg {...I} width="18" height="18">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5M15 12H3" />
    </svg>
  ),
  device: (
    <svg {...I} width="18" height="18">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  calendar: (
    <svg {...I} width="18" height="18">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  exit: (
    <svg {...I} width="18" height="18">
      <path d="M13 4h6v16h-6" />
      <path d="m8 8-4 4 4 4M4 12h9" />
    </svg>
  ),
};

/* ---------- 숫자 타일 ---------- */
export function StatTile({ icon, label, value, unit, desc }: { icon: React.ReactNode; label: string; value: string | number; unit?: string; desc: string }) {
  return (
    <div className="border border-line border-t-2 border-t-ink bg-white px-[22px] py-[20px]">
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[36px] w-[36px] items-center justify-center border border-line bg-surface text-ink">{icon}</span>
        <span className="text-[13px] font-medium text-graphite">{label}</span>
      </div>
      <p className="mt-[14px] text-[34px] font-bold leading-none tracking-[-0.03em] text-ink" style={NUM}>
        {value}
        {unit && <span className="ml-[2px] text-[18px] font-semibold">{unit}</span>}
      </p>
      <p className="mt-[10px] text-[12px] text-muted">{desc}</p>
    </div>
  );
}

/* ---------- 한 줄 요약 배너 ---------- */
export function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[14px] border border-line bg-white px-[20px] py-[16px] text-graphite">
      <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center bg-ink text-white">{Icons.trend}</span>
      <p className="leading-[26px] [&_b]:text-[16px]" style={{ fontSize: 16, fontWeight: 700 }}>
        {children}
      </p>
    </div>
  );
}

/* ---------- 아이콘 카드 ---------- */
export function ChartCard({ icon, title, sub, className = "", children }: { icon: React.ReactNode; title: string; sub: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`border border-line bg-white p-[22px] max-pc:p-[16px] ${className}`}>
      <div className="flex items-start gap-[12px]">
        <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center border border-line bg-surface text-ink">{icon}</span>
        <div>
          <h2 className="text-[16px] font-bold leading-[20px] tracking-[-0.01em] text-ink">{title}</h2>
          <p className="mt-[4px] text-[12px] text-muted">{sub}</p>
        </div>
      </div>
      <div className="mt-[20px]">{children}</div>
    </section>
  );
}

/* ---------- 항목별 가로 막대 (라벨 · 막대 · N명 (P%)) ---------- */
export function BarRows({ items, total, unit = "명", empty, showPct = true }: { items: Bucket[]; total: number; unit?: string; empty: string; showPct?: boolean }) {
  if (items.length === 0) return <p className="py-[16px] text-center text-[13px] text-muted">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="flex flex-col gap-[14px]">
      {items.map((it) => {
        const pct = total ? Math.round((it.count / total) * 100) : 0;
        return (
          <li key={it.key} className="grid grid-cols-[minmax(0,120px)_1fr_auto] items-center gap-[14px] text-[13px]" title={`${it.label} · ${it.count}${unit}`}>
            <span className="truncate text-graphite">{it.label}</span>
            <div className="h-[14px] overflow-hidden rounded-[4px] bg-surface">
              <div className="h-full rounded-[4px] bg-ink" style={{ width: `${Math.max(2, Math.round((it.count / max) * 100))}%` }} />
            </div>
            <span className="min-w-[92px] whitespace-nowrap text-right text-[14px] font-bold text-ink" style={NUM}>
              {it.count}
              <span className="font-semibold">{unit}</span>
              {showPct && <span className="ml-[4px] text-[12px] font-semibold text-muted">({pct}%)</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- 날짜별 방문자 세로 막대 ---------- */
export function DailyChart({ daily }: { daily: { day: string; visitors: number; pageViews: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const many = daily.length > 31;
  const total = daily.reduce((a, d) => a + d.visitors, 0);
  const label = (day: string) => `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`;

  if (total === 0) return <p className="py-[24px] text-center text-[13px] text-muted">이 기간에는 방문 기록이 없습니다.</p>;

  return (
    /* 좁은 화면에서는 가로 스크롤, 처음엔 오른쪽 끝(오늘)이 보인다. 막대 하나당 최소 44px 확보 */
    <ScrollToEnd>
      <div className="flex items-end gap-[6px]" style={{ minWidth: daily.length * 44 }}>
        {daily.map((d) => {
          const h = Math.round((d.visitors / max) * 150);
          return (
            <div key={d.day} className="group flex min-w-0 flex-1 flex-col items-center justify-end" title={`${d.day.replace(/-/g, ".")} · 방문자 ${d.visitors}명 · 페이지뷰 ${d.pageViews}회`}>
              {!many && (
                <span className="mb-[6px] text-[12px] font-bold leading-none text-ink" style={NUM}>
                  {d.visitors || ""}
                </span>
              )}
              <div className="w-full max-w-[34px] rounded-t-[4px] bg-ink transition-colors group-hover:bg-graphite" style={{ height: `${Math.max(h, d.visitors ? 3 : 0)}px` }} />
              <span className={`mt-[8px] text-[11px] leading-none text-muted ${many ? "hidden" : ""}`} style={NUM}>
                {label(d.day)}
              </span>
            </div>
          );
        })}
      </div>
      {many && (
        <div className="mt-[6px] flex justify-between text-[11px] text-muted" style={NUM}>
          <span>{label(daily[0].day)}</span>
          <span>{label(daily[daily.length - 1].day)}</span>
        </div>
      )}
    </ScrollToEnd>
  );
}

/* ---------- 시간대(0~23시) 세로 막대 ---------- */
export function HourlyChart({ hourly }: { hourly: number[] }) {
  const max = Math.max(1, ...hourly);
  const total = hourly.reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="py-[24px] text-center text-[13px] text-muted">이 기간에는 방문 기록이 없습니다.</p>;
  const peak = hourly.indexOf(max);

  return (
    <div>
      <div className="flex h-[160px] items-end gap-[3px]">
        {hourly.map((v, h) => (
          <div key={h} className="group flex min-w-0 flex-1 flex-col items-center justify-end" title={`${h}시 · ${v}회`}>
            <div className={`w-full rounded-t-[3px] transition-colors group-hover:bg-graphite ${h === peak ? "bg-ink" : "bg-faint"}`} style={{ height: `${Math.max(Math.round((v / max) * 150), v ? 3 : 0)}px` }} />
          </div>
        ))}
      </div>
      <div className="mt-[8px] flex justify-between text-[11px] text-muted" style={NUM}>
        <span>0시</span>
        <span>6시</span>
        <span>12시</span>
        <span>18시</span>
        <span>23시</span>
      </div>
    </div>
  );
}
