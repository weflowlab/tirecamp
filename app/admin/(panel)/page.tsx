import Link from "next/link";
import PeriodBar from "@/components/admin/PeriodBar";
import { Badge, Card, Empty, NUM, Stat, TABLE, TD, TH, TR_HOVER } from "@/components/admin/ui";
import { aggregate, firstRecordedDay, listDays, readRange } from "@/lib/analytics";
import { INQUIRIES_FILE, type Inquiry } from "@/lib/inquiries";
import { inPeriod, periodParams, resolvePeriod } from "@/lib/period";
import { kstDate, readList } from "@/lib/store";
import { getTires } from "@/lib/tires";

type Props = { searchParams: Promise<{ range?: string; from?: string; to?: string }> };

/**
 * 관리자 대시보드 (/admin?range=today …) — 기간 선택 → 숫자 타일 4개 → 기간 내 문의 목록
 * 기본 기간은 전체. 타일과 문의 목록이 모두 선택한 기간 기준으로 바뀐다 (노출 중 타이어만 현재 상태).
 */
export default async function AdminHome({ searchParams }: Props) {
  const sp = await searchParams;
  const today = kstDate();
  const [inquiries, tires, firstVisitDay] = await Promise.all([readList<Inquiry>(INQUIRIES_FILE), getTires(true), firstRecordedDay()]);
  const firstInquiryDay = inquiries.length ? inquiries.reduce((m, i) => (i.date.replace(/\./g, "-") < m ? i.date.replace(/\./g, "-") : m), today) : today;
  const period = resolvePeriod(sp, today, "all", firstVisitDay < firstInquiryDay ? firstVisitDay : firstInquiryDay);

  const stats = aggregate(await readRange(period.from, period.to), listDays(period.from, period.to));
  const inRange = inquiries.filter((i) => inPeriod(i.date, period)).sort((a, b) => b.id - a.id);
  const newCount = inRange.filter((i) => i.status === "new").length;
  const recent = inRange.slice(0, 10);
  const listHref = `/admin/inquiries?${new URLSearchParams(periodParams(period)).toString()}`;

  return (
    <div>
      <div className="mb-[24px] border-b border-line pb-[18px]">
        <p className="eyebrow">Overview</p>
        <h1 className="mt-[4px] text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-ink max-pc:text-[20px]">대시보드</h1>
        <p className="mt-[8px] text-[13px] text-muted" style={NUM}>
          {today.replace(/-/g, ".")}
        </p>
      </div>

      <PeriodBar basePath="/admin" period={period} today={today} />

      <div className="grid grid-cols-4 gap-[10px] max-pc:grid-cols-2">
        <Stat label="접수 문의" value={inRange.length} unit="건" sub="선택 기간에 들어온 문의" />
        <Stat label="미처리 문의" value={newCount} unit="건" sub={`처리 완료 ${inRange.length - newCount}건`} />
        <Stat label="방문자" value={stats.visitors} unit="명" sub={`페이지뷰 ${stats.pageViews}`} />
        <Stat label="노출 중 타이어" value={tires.filter((t) => t.visible).length} unit="종" sub={`등록 ${tires.length}종`} />
      </div>

      <div className="mt-[24px]">
        <Card
          eyebrow="Inquiries"
          title="최근 문의"
          action={
            <Link href={listHref} className="text-[12px] tracking-[0.04em] !text-muted hover:!text-ink hover:!no-underline">
              전체보기 →
            </Link>
          }
        >
          {recent.length === 0 ? (
            <Empty>이 기간에 접수된 문의가 없습니다.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className={TABLE}>
                <thead>
                  <tr>
                    <th className={TH}>상태</th>
                    <th className={TH}>이름</th>
                    <th className={TH}>유형</th>
                    <th className={`${TH} w-full`}>내용</th>
                    <th className={TH}>일자</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((i) => (
                    <tr key={i.id} className={TR_HOVER}>
                      <td className={TD}>
                        <Badge tone={i.status === "new" ? "ink" : "faint"}>{i.status === "new" ? "신규" : "완료"}</Badge>
                      </td>
                      <td className={`${TD} whitespace-nowrap font-semibold text-ink`}>{i.name}</td>
                      <td className={`${TD} whitespace-nowrap`}>{i.type}</td>
                      <td className={`${TD} max-w-[320px]`}>
                        <Link href={`/admin/inquiries?open=${i.id}`} className="block truncate !text-graphite hover:!text-ink">
                          {i.content}
                        </Link>
                      </td>
                      <td className={`${TD} whitespace-nowrap text-faint`} style={NUM}>
                        {i.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
