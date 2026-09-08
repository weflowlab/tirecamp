import type { Metadata } from "next";
import { BarRows, ChartCard, DailyChart, HourlyChart, Icons, Insight, StatTile } from "@/components/admin/StatsCharts";
import { Chip, NUM, PageHead } from "@/components/admin/ui";
import { aggregate, firstRecordedDay, listDays, readRange } from "@/lib/analytics";
import { kstDate } from "@/lib/store";

export const metadata: Metadata = { title: "방문자 통계" };

type Props = { searchParams: Promise<{ range?: string; from?: string; to?: string }> };

const RANGES = [
  ["today", "오늘"],
  ["7d", "최근 7일"],
  ["30d", "최근 30일"],
  ["month", "이번 달"],
  ["all", "전체"],
] as const;

function shift(day: string, n: number): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
}

/**
 * 방문자 통계 · 유입 관리 (/admin/stats?range=today | from=&to=) — 기본 오늘
 * 기간 선택 → 숫자 타일 4개 → 한 줄 요약 → 유입 경로/기기 → 날짜별 방문자 → 시간대/나간 페이지
 */
export default async function AdminStats({ searchParams }: Props) {
  const sp = await searchParams;
  const today = kstDate();
  const DATE = /^\d{4}-\d{2}-\d{2}$/;

  let range = RANGES.some(([k]) => k === sp.range) ? sp.range! : "";
  let from: string;
  let to = today;
  if (sp.from && sp.to && DATE.test(sp.from) && DATE.test(sp.to)) {
    from = sp.from <= sp.to ? sp.from : sp.to;
    to = sp.from <= sp.to ? sp.to : sp.from;
    range = "";
  } else {
    if (!range) range = "today";
    if (range === "today") from = today;
    else if (range === "7d") from = shift(today, -6);
    else if (range === "30d") from = shift(today, -29);
    else if (range === "month") from = `${today.slice(0, 7)}-01`;
    else from = await firstRecordedDay();
  }

  const days = listDays(from, to);
  const rows = await readRange(from, to);
  const s = aggregate(rows, days);

  /* 날짜별 방문자는 선택 기간과 상관없이 항상 최근 14일 (날이 지나면 왼쪽부터 밀려난다) */
  const days14 = listDays(shift(today, -13), today);
  const daily14 = aggregate(await readRange(days14[0], today), days14).daily;
  const fmt = (d: string) => d.replace(/-/g, ".");
  const mins = (sec: number) => (sec >= 60 ? `${Math.floor(sec / 60)}분 ${sec % 60}초` : `${sec}초`);
  const bounced = Math.round((s.visitors * s.bounceRate) / 100);
  const topSource = s.sources[0];
  const topPct = topSource && s.visitors ? Math.round((topSource.count / s.visitors) * 100) : 0;

  return (
    <div>
      <PageHead eyebrow="Analytics" title="방문자 통계 · 유입 관리" desc="홈페이지에 들어온 방문자를 기기 기준 하루 1명으로 셉니다." />

      {/* 기간 */}
      <div className="mb-[20px] flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch">
        <div className="flex flex-wrap gap-[6px]">
          {RANGES.map(([k, label]) => (
            <Chip key={k} href={`/admin/stats?range=${k}`} active={range === k}>
              {label}
            </Chip>
          ))}
        </div>
        <form method="get" className="flex items-center gap-[6px]">
          <input type="date" name="from" defaultValue={from} max={today} className="field !h-[30px] !w-[140px] !text-[12px] max-pc:!h-[36px] max-pc:min-w-0 max-pc:flex-1 max-pc:!w-auto" />
          <span className="shrink-0 text-[12px] text-faint">~</span>
          <input type="date" name="to" defaultValue={to} max={today} className="field !h-[30px] !w-[140px] !text-[12px] max-pc:!h-[36px] max-pc:min-w-0 max-pc:flex-1 max-pc:!w-auto" />
          <button type="submit" className="btn-outline !h-[30px] shrink-0 whitespace-nowrap !px-[12px] !text-[12px] text-ink hover:bg-ink hover:text-white max-pc:!h-[36px]">
            조회
          </button>
        </form>
      </div>
      <p className="mb-[12px] text-[12px] text-muted" style={NUM}>
        {fmt(from)} ~ {fmt(to)} · {days.length}일
      </p>

      {/* 숫자 타일 4개 */}
      <div className="grid grid-cols-4 gap-[12px] max-pc:grid-cols-2">
        <StatTile icon={Icons.users} label="방문자 수" value={s.visitors} unit="명" desc="선택 기간 방문 고객" />
        <StatTile icon={Icons.eye} label="본 페이지 수" value={s.pageViews} unit="회" desc="고객들이 열어본 페이지" />
        <StatTile icon={Icons.bounce} label="즉시 이탈률" value={s.bounceRate} unit="%" desc={`한 페이지만 보고 이탈 (${bounced}명)`} />
        <StatTile icon={Icons.clock} label="평균 머문 시간" value={mins(s.avgDurationSec)} desc="한 명이 머문 평균 시간" />
      </div>

      {/* 한 줄 요약 */}
      <div className="mt-[16px]">
        <Insight>
          {topSource ? (
            <>
              고객이 가장 많이 들어온 곳은 <b className="text-ink">{topSource.label}</b> 이에요 — 전체 방문자의{" "}
              <b className="text-ink" style={NUM}>
                {topPct}%
              </b>
            </>
          ) : (
            "이 기간에는 아직 방문 기록이 없어요."
          )}
        </Insight>
      </div>

      {/* 유입 경로 / 기기 */}
      <div className="mt-[16px] grid grid-cols-2 gap-[16px] max-pc:grid-cols-1">
        <ChartCard icon={Icons.login} title="어디서 들어왔나요?" sub="고객들이 우리 사이트를 찾은 경로">
          <BarRows items={s.sources} total={s.visitors} empty="아직 방문 기록이 없습니다." />
        </ChartCard>
        <ChartCard icon={Icons.device} title="무엇으로 봤나요?" sub="휴대폰·컴퓨터 등 접속 기기">
          <BarRows items={s.devices} total={s.visitors} empty="아직 방문 기록이 없습니다." />
        </ChartCard>
      </div>

      {/* 날짜별 방문자 */}
      <div className="mt-[16px]">
        <ChartCard icon={Icons.calendar} title="날짜별 방문자" sub="최근 14일 동안 하루에 몇 명이 왔는지">
          <DailyChart daily={daily14} />
        </ChartCard>
      </div>

      {/* 시간대 / 나간 페이지 */}
      <div className="mt-[16px] grid grid-cols-2 gap-[16px] max-pc:grid-cols-1">
        <ChartCard icon={Icons.clock} title="언제 많이 오나요?" sub="하루 중 방문이 몰리는 시간대 (0~23시)">
          <HourlyChart hourly={s.hourly} />
        </ChartCard>
        <ChartCard icon={Icons.exit} title="어느 페이지에서 나갔나요?" sub="고객이 마지막으로 보고 떠난 페이지">
          <BarRows items={s.exitPages} total={s.visitors} unit="명" showPct={false} empty="아직 방문 기록이 없습니다." />
        </ChartCard>
      </div>

    </div>
  );
}
