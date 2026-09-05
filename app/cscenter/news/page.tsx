import type { Metadata } from "next";
import Link from "next/link";
import BoardPager from "@/components/board/BoardPager";
import { NEWS, NEWS_PAGE_SIZE, newsViewHref } from "@/lib/news";

export const metadata: Metadata = {
  title: "소식 | 타이어공장 - 전브랜드 인터넷가 판매",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DOTUM = "돋움, 'Nanum Gothic', sans-serif";

/**
 * 소식 & 공지사항 목록 (원본 /cscenter/news/default.aspx)
 * - newstitle.gif → 2px 회색선 → 상단 공지 박스(newsicon + 파란 제목) → 이미지 목록(썸네일/제목/날짜|조회) → 페이지 번호
 */
export default async function NewsListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.spage ?? "1"), 10) || 1);
  const lpage = Math.max(1, parseInt(String(sp.lpage ?? "1"), 10) || 1);
  const totalPages = Math.max(1, Math.ceil(NEWS.length / NEWS_PAGE_SIZE));
  const rows = NEWS.slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE);
  const notices = NEWS.filter((n) => n.notice);

  return (
    /* 모바일: 고정폭(675/658/640) 을 모두 100% 로 */
    <div className="w-[675px] max-pc:w-full">
      {/* 타이틀 이미지 */}
      <div className="h-[60px] max-pc:h-auto">
        <img src="/images/cscenter/newstitle.gif" width={500} height={60} alt="소식 & 공지사항" />
      </div>
      <div className="w-[676px] h-[2px] bg-[#E4E4E4] max-pc:w-full" />
      <div style={{ height: 28 }} />

      {/* 목록 영역 (658px, 우측 정렬) */}
      <div className="w-[658px] flex flex-col items-end max-pc:w-full max-pc:items-stretch">
        {/* 상단 공지 박스 */}
        {notices.map((n) => (
          <table key={`notice-${n.seq}`} style={{ width: 642, height: 26, border: "3px solid #EEEEEE" }} className="m-fluid">
            <tbody>
              <tr>
                <td style={{ height: 20, width: 49, textAlign: "center", verticalAlign: "middle" }}>
                  <img src="/images/icon/newsicon.gif" width={30} height={16} alt="" className="inline" />
                </td>
                <td style={{ height: 26, width: 591, verticalAlign: "middle" }} rowSpan={2}>
                  <Link href={newsViewHref(n.seq, page, lpage)} style={{ color: "#0365F8" }}>
                    <b>{n.title}</b>
                  </Link>
                </td>
              </tr>
              <tr>
                <td style={{ height: 1, width: 49 }} />
              </tr>
            </tbody>
          </table>
        ))}

        <div className="w-[640px] h-[30px] max-pc:w-full" />

        {/* 이미지가 있는 일반 목록 — 모바일: 썸네일(100px) | 제목/날짜/요약 세로 */}
        {rows.map((n) => (
          <div key={n.seq} className="w-[640px] max-pc:w-full">
            <table style={{ width: 640, height: 82 }} className="m-fluid">
              <tbody>
                <tr>
                  <td style={{ width: 103, verticalAlign: "top", textAlign: "left" }} className="max-pc:pr-[10px]">
                    <Link href={newsViewHref(n.seq, page, lpage)}>
                      {n.thumb && <img src={n.thumb} width={100} height={150} alt="" className="img-fixed" />}
                    </Link>
                  </td>
                  <td style={{ width: 20, verticalAlign: "top" }} className="max-pc:hidden">　</td>
                  <td style={{ width: 517, verticalAlign: "top" }}>
                    <table style={{ width: 515, height: 79 }} className="m-stack">
                      <tbody>
                        <tr>
                          <td style={{ height: 23, width: 416, verticalAlign: "middle" }}>
                            <Link href={newsViewHref(n.seq, page, lpage)} style={{ fontFamily: DOTUM, fontSize: "12pt", fontWeight: 700 }}>
                              {n.title}
                            </Link>
                          </td>
                          <td
                            style={{ height: 23, width: 99, verticalAlign: "middle", textAlign: "center", color: "#ADADAD", fontSize: "8pt" }}
                            className="max-pc:!text-left max-pc:py-[2px]"
                          >
                            {n.date} | {n.views}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ height: 56, width: 515, fontFamily: DOTUM, fontSize: "8pt", color: "#999999" }} colSpan={2}>
                            {n.summary}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ height: 5 }} />
            <div className="w-[640px] h-[8px] max-pc:w-full" style={{ backgroundImage: "url(/images/findsize/dotline.gif)" }} />
            <div style={{ height: 20 }} />
          </div>
        ))}
      </div>

      {/* 페이지 번호 */}
      <div style={{ height: 14 }} />
      <div className="w-[663px] h-[29px] text-center max-pc:w-full">
        <BoardPager page={page} totalPages={totalPages} basePath="/cscenter/news" />
      </div>
    </div>
  );
}
