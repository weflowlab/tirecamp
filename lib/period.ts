/*
 * 관리자 화면 공통 기간 선택 (대시보드 · 문의 관리 · 방문자 통계)
 * - ?range=today|7d|30d|month|all 또는 ?from=YYYY-MM-DD&to=YYYY-MM-DD
 * - 순수 함수만 (클라이언트에서도 import 가능)
 */
export const RANGES = [
  ["today", "오늘"],
  ["7d", "최근 7일"],
  ["30d", "최근 30일"],
  ["month", "이번 달"],
  ["all", "전체"],
] as const;

export type RangeKey = (typeof RANGES)[number][0];

export type Period = {
  /** 선택된 칩 ("" = 직접 입력한 기간) */
  range: RangeKey | "";
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** day 에서 n 일 이동 */
export function shiftDay(day: string, n: number): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
}

/**
 * 쿼리 → 기간. from/to 가 둘 다 있으면 직접 입력, 아니면 range (없으면 defaultRange).
 * "전체" 의 시작일은 firstDay (기록이 있는 가장 오래된 날짜) 로 채운다.
 */
export function resolvePeriod(sp: { range?: string; from?: string; to?: string }, today: string, defaultRange: RangeKey, firstDay: string): Period {
  if (sp.from && sp.to && DATE.test(sp.from) && DATE.test(sp.to)) {
    const [a, b] = sp.from <= sp.to ? [sp.from, sp.to] : [sp.to, sp.from];
    return { range: "", from: a, to: b > today ? today : b };
  }
  const range = (RANGES.some(([k]) => k === sp.range) ? sp.range : defaultRange) as RangeKey;
  const from =
    range === "today" ? today : range === "7d" ? shiftDay(today, -6) : range === "30d" ? shiftDay(today, -29) : range === "month" ? `${today.slice(0, 7)}-01` : firstDay < today ? firstDay : today;
  return { range, from, to: today };
}

/** 기간 쿼리 문자열 조각 (다른 쿼리와 합칠 때) */
export function periodParams(p: Period): Record<string, string> {
  return p.range ? { range: p.range } : { from: p.from, to: p.to };
}

/** "YYYY.MM.DD" (문의 접수일 표기) 가 기간 안인지 */
export function inPeriod(dotDate: string, p: Period): boolean {
  const d = dotDate.replace(/\./g, "-");
  return d >= p.from && d <= p.to;
}
