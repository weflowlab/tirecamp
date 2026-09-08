import Link from "next/link";
import { Badge, Card, Empty, NUM, Stat, TABLE, TD, TH, TR_HOVER } from "@/components/admin/ui";
import { aggregate, readRange } from "@/lib/analytics";
import { INQUIRIES_FILE, type Inquiry } from "@/lib/inquiries";
import { POPUPS_FILE, popupState, type Popup } from "@/lib/popups";
import { kstDate, readList } from "@/lib/store";
import { getTires } from "@/lib/tires";

/**
 * 관리자 대시보드 (/admin) — 오늘 숫자 4개 + 최근 문의 + 노출 중 팝업
 */
export default async function AdminHome() {
  const today = kstDate();
  const [inquiries, tires, popups, todayViews] = await Promise.all([
    readList<Inquiry>(INQUIRIES_FILE),
    getTires(true),
    readList<Popup>(POPUPS_FILE),
    readRange(today, today),
  ]);
  const stats = aggregate(todayViews, [today]);
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const recent = inquiries.slice().sort((a, b) => b.id - a.id).slice(0, 6);
  const activePopups = popups.filter((p) => popupState(p, today) === "active");

  return (
    <div>
      <div className="mb-[24px] border-b border-line pb-[18px]">
        <p className="eyebrow">Overview</p>
        <h1 className="mt-[4px] text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-ink max-pc:text-[20px]">대시보드</h1>
        <p className="mt-[8px] text-[13px] text-muted" style={NUM}>
          {today.replace(/-/g, ".")}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-[10px] max-pc:grid-cols-2">
        <Stat label="미처리 문의" value={newCount} unit="건" sub={`전체 ${inquiries.length}건`} />
        <Stat label="처리 완료 문의" value={inquiries.length - newCount} unit="건" sub={`전체 ${inquiries.length}건`} />
        <Stat label="오늘 방문자" value={stats.visitors} unit="명" sub={`페이지뷰 ${stats.pageViews}`} />
        <Stat label="노출 중 타이어" value={tires.filter((t) => t.visible).length} unit="종" sub={`등록 ${tires.length}종`} />
      </div>

      <div className="mt-[24px] grid grid-cols-[1fr_320px] gap-[16px] max-pc:grid-cols-1">
        <Card
          eyebrow="Inquiries"
          title="최근 문의"
          action={
            <Link href="/admin/inquiries" className="text-[12px] tracking-[0.04em] !text-muted hover:!text-ink hover:!no-underline">
              전체보기 →
            </Link>
          }
        >
          {recent.length === 0 ? (
            <Empty>아직 접수된 문의가 없습니다.</Empty>
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

        <div className="flex flex-col gap-[16px]">
          <Card
            eyebrow="Popup"
            title="노출 중 팝업"
            action={
              <Link href="/admin/popups" className="text-[12px] tracking-[0.04em] !text-muted hover:!text-ink hover:!no-underline">
                관리 →
              </Link>
            }
          >
            {activePopups.length === 0 ? (
              <p className="text-[13px] text-muted">지금 노출 중인 팝업이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-[10px]">
                {activePopups.map((p) => (
                  <li key={p.id} className="flex items-center gap-[10px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.pcImage} alt="" className="h-[44px] w-[60px] shrink-0 border border-line object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-ink">{p.title}</p>
                      <p className="text-[11px] text-faint" style={NUM}>
                        ~ {p.end.replace(/-/g, ".")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            eyebrow="Today"
            title="오늘 유입"
            action={
              <Link href="/admin/stats" className="text-[12px] tracking-[0.04em] !text-muted hover:!text-ink hover:!no-underline">
                통계 자세히 →
              </Link>
            }
          >
            {stats.sources.length === 0 ? (
              <p className="text-[13px] text-muted">아직 오늘 방문 기록이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-[8px] text-[13px]">
                {stats.sources.slice(0, 5).map((s) => (
                  <li key={s.key} className="flex items-center justify-between gap-[10px]">
                    <span className="truncate text-graphite">{s.label}</span>
                    <span className="shrink-0 text-ink" style={NUM}>
                      {s.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
