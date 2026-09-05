import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjacentNews, findNews, newsViewHref, sanitizeHtml } from "@/lib/news";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DOTUM = "돋움, 'Nanum Gothic', sans-serif";
const BOARD_IMG = "/ext/boomcar.co.kr/images/board";

/* 원본 <title>: "{제목} | 타이어공장 - 전브랜드 인터넷가 판매" */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const item = findNews(parseInt(String(sp.seq ?? ""), 10));
  return { title: `${item?.title ?? "소식"} | 타이어공장 - 전브랜드 인터넷가 판매` };
}

/**
 * 소식 & 공지사항 상세 (원본 /cscenter/news/view.aspx?bcode=01&seq=N&spage=S&lpage=L)
 * - 제목/날짜|조회 → 점선 → 본문 HTML → 이전글/다음글 → 이전/목록/다음 버튼
 */
export default async function NewsViewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const seq = parseInt(String(sp.seq ?? ""), 10);
  const spage = parseInt(String(sp.spage ?? "1"), 10) || 1;
  const lpage = parseInt(String(sp.lpage ?? "1"), 10) || 1;
  const item = findNews(seq);
  if (!item) notFound();

  const { prev, next } = adjacentNews(seq);
  const listHref = `/cscenter/news?spage=${spage}&lpage=${lpage}`;
  const cellBorder = { borderBottom: "1px dotted #666666" } as const;

  return (
    <div style={{ width: 675 }}>
      {/* 타이틀 이미지 */}
      <div style={{ height: 60 }}>
        <img src="/images/cscenter/newstitle.gif" width={500} height={60} alt="소식 & 공지사항" />
      </div>
      <div style={{ width: 656, height: 2, backgroundColor: "#E4E4E4" }} />
      <div style={{ height: 28 }} />

      {/* 제목 / 날짜 | 조회수 (원본은 열람 시 조회수 +1 되어 표시) */}
      <table style={{ width: 657 }}>
        <tbody>
          <tr>
            <td style={{ height: 43, width: 512, textAlign: "left" }}>
              <b style={{ fontSize: "16px", fontFamily: DOTUM }}>{item.title}</b>
            </td>
            <td style={{ height: 43, width: 145, textAlign: "center" }}>
              <span style={{ color: "#969696", fontSize: "8pt" }}>{item.date}</span> <span style={{ color: "#808080" }}>|</span>{" "}
              <span style={{ color: "#969696", fontSize: "8pt" }}>{item.views + 1}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 본문 */}
      <div style={{ width: 658 }}>
        <div style={{ width: 657, height: 8, backgroundImage: "url(/images/findsize/dotline.gif)" }} />
        <div className="flex justify-center">
          <div style={{ width: 638 }}>
            <div style={{ height: 10 }} />
            <div
              /* Tailwind preflight 가 img 를 block 으로 만들므로 원본 <center><img> 정렬을 위해 inline 복원 */
              className="news-content [&_img]:inline [&_center]:text-center"
              style={{ fontSize: "9pt" }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
            />
            <div style={{ height: 10 }} />
          </div>
        </div>
      </div>
      <div style={{ height: 20 }} />

      {/* 이전글 / 다음글 */}
      <table style={{ width: 658, height: 23 }}>
        <tbody>
          <tr>
            <td style={{ width: 77, height: 25, textAlign: "left", ...cellBorder }}>
              &nbsp;
              <img src={`${BOARD_IMG}/point_pre.gif`} width={11} height={11} alt="" className="inline" /> 이전글 :
            </td>
            <td style={{ width: 626, height: 25, textAlign: "left", ...cellBorder }}>
              {prev ? <Link href={newsViewHref(prev.seq, spage, lpage)}>{prev.title}</Link> : <>&nbsp;</>}
            </td>
          </tr>
          <tr>
            <td style={{ width: 77, height: 25, textAlign: "left" }}>
              &nbsp;
              <img src={`${BOARD_IMG}/point_next.gif`} width={11} height={11} alt="" className="inline" /> 다음글 :
            </td>
            <td style={{ width: 626, height: 25, textAlign: "left" }}>
              {next ? <Link href={newsViewHref(next.seq, spage, lpage)}>{next.title}</Link> : <>&nbsp;</>}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ height: 15 }} />

      {/* 이전 / 목록 / 다음 버튼 (없으면 회색 버튼) */}
      <div style={{ width: 658, height: 42 }} className="flex justify-end items-center gap-[4px]">
        {prev ? (
          <Link href={newsViewHref(prev.seq, spage, lpage)}>
            <img src={`${BOARD_IMG}/board_txt_pre_but.gif`} width={58} height={22} alt="이전" />
          </Link>
        ) : (
          <img src={`${BOARD_IMG}/board_txt_pre_but_grale.gif`} width={58} height={22} alt="" />
        )}
        <Link href={listHref}>
          <img src="/ext/boomcar.co.kr/images/blog/board/board_txt_golist_but.gif" width={76} height={22} alt="목록" />
        </Link>
        {next ? (
          <Link href={newsViewHref(next.seq, spage, lpage)}>
            <img src={`${BOARD_IMG}/board_txt_next_but.gif`} width={58} height={22} alt="다음" />
          </Link>
        ) : (
          <img src={`${BOARD_IMG}/board_txt_next_but_grale.gif`} width={58} height={22} alt="" />
        )}
      </div>
    </div>
  );
}
