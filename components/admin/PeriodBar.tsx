"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RANGES, type Period } from "@/lib/period";
import { BTN_OUTLINE, Chip } from "./ui";

/**
 * 기간 선택 줄 (대시보드 · 문의 관리 · 방문자 통계 공통)
 * - 칩(오늘/7일/30일/이번 달/전체) + 날짜 직접 입력 · 조회 + 새로고침 (+ 엑셀 다운로드)
 * - 다른 필터(상태·검색어)는 keep 으로 넘겨 주면 링크와 폼에 그대로 실어 보낸다
 */
export default function PeriodBar({
  basePath,
  period,
  today,
  keep = {},
  exportHref,
}: {
  basePath: string;
  period: Period;
  today: string;
  keep?: Record<string, string>;
  /** 엑셀 다운로드 링크 (없으면 버튼 숨김) */
  exportHref?: string;
}) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const kept = Object.entries(keep).filter(([, v]) => v);

  const href = (params: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of kept) p.set(k, v);
    for (const [k, v] of Object.entries(params)) p.set(k, v);
    const s = p.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };

  const refresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <div className="mb-[16px]">
      <div className="flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch">
        <div className="flex flex-wrap gap-[6px]">
          {RANGES.map(([k, label]) => (
            <Chip key={k} href={href({ range: k })} active={period.range === k}>
              {label}
            </Chip>
          ))}
        </div>
        <form method="get" action={basePath} className="flex items-center gap-[6px]">
          {kept.map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <input type="date" name="from" defaultValue={period.from} max={today} className="field !h-[30px] !w-[140px] !text-[12px] max-pc:!h-[36px] max-pc:min-w-0 max-pc:flex-1 max-pc:!w-auto" />
          <span className="shrink-0 text-[12px] text-faint">~</span>
          <input type="date" name="to" defaultValue={period.to} max={today} className="field !h-[30px] !w-[140px] !text-[12px] max-pc:!h-[36px] max-pc:min-w-0 max-pc:flex-1 max-pc:!w-auto" />
          <button type="submit" className="btn-outline !h-[30px] shrink-0 whitespace-nowrap !px-[12px] !text-[12px] text-ink hover:bg-ink hover:text-white max-pc:!h-[36px]">
            조회
          </button>
        </form>
      </div>
      <div className="mt-[10px] flex items-center justify-end gap-[10px]">
        <div className="flex items-center gap-[6px]">
          <button type="button" onClick={refresh} className={`${BTN_OUTLINE} !h-[30px] !px-[10px]`} title="새로고침">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`mr-[6px] ${spinning ? "animate-spin" : ""}`}>
              <path d="M21 12a9 9 0 1 1-2.6-6.4" />
              <path d="M21 3v6h-6" />
            </svg>
            새로고침
          </button>
          {exportHref && (
            <Link href={exportHref} className={`${BTN_OUTLINE} !h-[30px] !px-[10px] !no-underline`} prefetch={false}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mr-[6px]">
                <path d="M12 3v12M6 9l6 6 6-6" />
                <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
              엑셀 다운로드
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
