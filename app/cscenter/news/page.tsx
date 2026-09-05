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
    <div style={{ width: 675 }}>
      {/* 타이틀 이미지 */}
      <div style={{ height: 60 }}>
        <img src="/images/cscenter/newstitle.gif" width={500} height={60} alt="소식 & 공지사항" />
      </div>
      <div style={{ width: 676, height: 2, backgroundColor: "#E4E4E4" }} />
      <div style={{ height: 28 }} />

      {/* 목록 영역 (658px, 우측 정렬) */}
      <div style={{ width: 658 }} className="flex flex-col items-end">
        {/* 상단 공지 박스 */}
        {notices.map((n) => (
          <table key={`notice-${n.seq}`} style={{ width: 642, height: 26, border: "3px solid #EEEEEE" }}>
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

        <div style={{ width: 640, height: 30 }} />

        {/* 이미지가 있는 일반 목록 */}
        {rows.map((n) => (
          <div key={n.seq} style={{ width: 640 }}>
            <table style={{ width: 640, height: 82 }}>
              <tbody>
                <tr>
                  <td style={{ width: 103, verticalAlign: "top", textAlign: "left" }}>
                    <Link href={newsViewHref(n.seq, page, lpage)}>
                      {n.thumb && <img src={n.thumb} width={100} height={150} alt="" />}
                    </Link>
                  </td>
                  <td style={{ width: 20, verticalAlign: "top" }}>　</td>
                  <td style={{ width: 517, verticalAlign: "top" }}>
                    <table style={{ width: 515, height: 79 }}>
                      <tbody>
                        <tr>
                          <td style={{ height: 23, width: 416, verticalAlign: "middle" }}>
                            <Link href={newsViewHref(n.seq, page, lpage)} style={{ fontFamily: DOTUM, fontSize: "12pt", fontWeight: 700 }}>
                              {n.title}
                            </Link>
                          </td>
                          <td style={{ height: 23, width: 99, verticalAlign: "middle", textAlign: "center", color: "#ADADAD", fontSize: "8pt" }}>
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
            <div style={{ width: 640, height: 8, backgroundImage: "url(/images/findsize/dotline.gif)" }} />
            <div style={{ height: 20 }} />
          </div>
        ))}
      </div>

      {/* 페이지 번호 */}
      <div style={{ height: 14 }} />
      <div style={{ width: 663, height: 29, textAlign: "center" }}>
        <BoardPager page={page} totalPages={totalPages} basePath="/cscenter/news" />
      </div>
    </div>
  );
}
