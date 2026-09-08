import type { Metadata } from "next";
import Link from "next/link";
import BoardPager from "@/components/board/BoardPager";
import { getNews, NEWS_PAGE_SIZE, newsPreview, newsViewHref } from "@/lib/news";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("공지사항"),
};

/* 요청 시마다 data/news.json 을 읽는다 (관리자 수정 즉시 반영) */
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * 공지사항 목록 (/cscenter/news)
 * - 타이틀 → 목록(썸네일 | 제목/날짜/요약, 얇은 선 구분) → 페이지 번호
 * - 원본 spage/lpage 쿼리 유지
 */
export default async function NewsListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const NEWS = await getNews();
  const page = Math.max(1, parseInt(String(sp.spage ?? "1"), 10) || 1);
  const lpage = Math.max(1, parseInt(String(sp.lpage ?? "1"), 10) || 1);
  const totalPages = Math.max(1, Math.ceil(NEWS.length / NEWS_PAGE_SIZE));
  const rows = NEWS.slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE);

  return (
    <div className="w-full font-sans">
      <p className="eyebrow">Notice</p>
      <h1 className="mt-[4px] mb-[24px] text-[24px] font-bold tracking-[-0.03em] text-ink max-pc:text-[20px]">공지사항</h1>

      <ul className="border-t border-line">
        {rows.length === 0 && <li className="py-[48px] text-center text-[13px] text-muted">등록된 공지사항이 없습니다.</li>}
        {rows.map((n) => (
          <li key={n.seq} className="border-b border-line">
            <Link href={newsViewHref(n.seq, page, lpage)} className="flex gap-[20px] py-[20px] hover:!no-underline group">
              {/* 썸네일: 가로·세로 어떤 비율이든 3:2 상자에 맞춰 가운데를 잘라 보여준다 */}
              {n.thumb && <img src={n.thumb} alt="" className="img-fixed h-[100px] w-[150px] shrink-0 border border-line object-cover max-pc:h-[72px] max-pc:w-[108px]" />}
              {/* 썸네일이 있으면 칸이 높아지므로 날짜·조회수는 맨 아래로 붙이고, 미리보기는 최대 3줄 */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-[10px]">
                  {n.notice && <span className="eyebrow shrink-0 !text-ink">Notice</span>}
                  <span className="truncate text-[15px] font-medium !text-ink group-hover:!text-graphite">{n.title}</span>
                </div>
                <p className="mt-[6px] line-clamp-3 whitespace-pre-line text-[13px] leading-[21px] text-muted max-pc:line-clamp-2">{newsPreview(n.content)}</p>
                <p className="mt-auto pt-[8px] text-[12px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
                  {n.date} · 조회 {n.views}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-[24px] text-center">
        <BoardPager page={page} totalPages={totalPages} basePath="/cscenter/news" />
      </div>
    </div>
  );
}
