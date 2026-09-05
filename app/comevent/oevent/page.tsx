import type { Metadata } from "next";
import Link from "next/link";
import BoardPager from "@/components/board/BoardPager";
import eventsData from "@/data/events.json";

export const metadata: Metadata = {
  title: "이벤트 | 타이어공장 - 전브랜드 인터넷가 판매",
};

/* 이벤트 1건 (원본 목록에 데이터가 없어 항목 구조는 소식 목록을 참고해 정의) */
type EventItem = {
  seq: number;
  title: string;
  /** 진행 기간 표시 문자열 (예: 2026.07.01 ~ 2026.07.31) */
  period: string;
  /** 목록 썸네일 (없으면 빈 문자열) */
  thumb: string;
  /** 클릭 시 이동 경로 */
  href: string;
};

const EVENTS = eventsData as EventItem[];
const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * 이벤트 목록 (원본 /comevent/oevent.aspx)
 * - eventtitle.gif 타이틀 바(테두리 #EBEBEB) → aibtbar.gif 구분 바 → 목록(없으면 "데이타가 없습니다.") → 페이지 번호
 * - 원본 hidden spage/lpage 폼 POST 는 ?spage=&lpage= 쿼리로 대체
 */
export default async function EventListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.spage ?? "1"), 10) || 1);
  const totalPages = Math.ceil(EVENTS.length / PAGE_SIZE);
  const rows = EVENTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-[900px]">
      {/* 타이틀 바 */}
      <table style={{ width: 900, height: 54, border: "1px solid #EBEBEB" }}>
        <tbody>
          <tr>
            <td style={{ height: 52, width: 21 }}>　</td>
            <td style={{ height: 52, width: 277, verticalAlign: "middle" }}>
              <img src="/images/main/eventtitle.gif" width={259} height={27} alt="이벤트" />
            </td>
            <td style={{ height: 52, width: 602, textAlign: "right", verticalAlign: "middle", color: "#B7B7B7" }}>
              <b>타이어공장</b>의 특별한 이벤트를 만나보세요.&nbsp;&nbsp;
            </td>
          </tr>
        </tbody>
      </table>

      {/* 구분 바 (aibtbar.gif 배경) */}
      <div style={{ width: 900, height: 10, backgroundImage: "url(/images/main/aibtbar.gif)" }} />
      <div style={{ height: 15 }} />

      {/* 목록 */}
      <table style={{ width: 900 }}>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td style={{ width: 900, height: 115, textAlign: "center" }}>데이타가 없습니다.</td>
            </tr>
          ) : (
            rows.map((ev) => (
              <tr key={ev.seq}>
                <td style={{ width: 900, height: 82, padding: "0 20px" }}>
                  <table style={{ width: 860 }}>
                    <tbody>
                      <tr>
                        {ev.thumb && (
                          <td style={{ width: 123, verticalAlign: "top" }}>
                            <Link href={ev.href}>
                              <img src={ev.thumb} alt="" />
                            </Link>
                          </td>
                        )}
                        <td style={{ verticalAlign: "top" }}>
                          <div style={{ height: 23, lineHeight: "23px" }}>
                            <Link href={ev.href} style={{ fontFamily: "돋움, 'Nanum Gothic', sans-serif", fontSize: "12pt", fontWeight: 700 }}>
                              {ev.title}
                            </Link>
                          </div>
                          <div style={{ color: "#ADADAD", fontSize: "8pt" }}>{ev.period}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="dotline" style={{ marginTop: 5 }} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ height: 25 }} />

      {/* 페이지 번호 (데이터가 없으면 원본처럼 빈 영역) */}
      <div style={{ width: 900, height: 29, textAlign: "center" }}>
        <BoardPager page={page} totalPages={totalPages} basePath="/comevent/oevent" />
      </div>
    </div>
  );
}
