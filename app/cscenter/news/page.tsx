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
              {n.thumb && (
                <img src={n.thumb} width={100} height={150} alt="" className="img-fixed h-[120px] w-[80px] shrink-0 object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[10px]">
                  {n.notice && <span className="eyebrow shrink-0 !text-ink">Notice</span>}
                  <span className="truncate text-[15px] font-medium !text-ink group-hover:!text-graphite">{n.title}</span>
                </div>
                {/* 본문 첫 줄 미리보기 (뒤에 내용이 더 있으면 …) */}
                <p className="mt-[6px] truncate text-[13px] leading-[21px] text-muted">{newsPreview(n.content)}</p>
                <p className="mt-[6px] text-[12px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
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
