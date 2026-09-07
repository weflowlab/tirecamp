import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjacentNews, findNews, newsViewHref, sanitizeHtml } from "@/lib/news";
import { pageTitle } from "@/lib/site";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const item = findNews(parseInt(String(sp.seq ?? ""), 10));
  return { title: pageTitle(item?.title ?? "공지사항") };
}

/**
 * 공지사항 상세 (/cscenter/news/view?bcode=01&seq=N&spage=S&lpage=L)
 * - 제목/날짜 → 본문 HTML → 이전글/다음글 → 목록 버튼
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

  return (
    <div className="w-full font-sans">
      <p className="eyebrow">Notice</p>
      <h1 className="mt-[4px] text-[22px] font-bold leading-[1.4] tracking-[-0.02em] text-ink max-pc:text-[19px]">{item.title}</h1>
      <p className="mt-[8px] mb-[20px] text-[12px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
        {item.date} · 조회 {item.views + 1}
      </p>

      {/* 본문 (관리자 입력 HTML) */}
      <div
        className="news-content border-y border-line py-[28px] text-[14px] leading-[26px] text-graphite [&_img]:inline [&_center]:text-center [&_p]:text-[14px] [&_p]:text-graphite max-pc:[&_table]:max-w-full max-pc:[&_table]:!w-auto max-pc:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
      />

      {/* 이전글 / 다음글 */}
      <ul className="mt-[8px] text-[13px]">
        <li className="flex gap-[16px] border-b border-line py-[12px]">
          <span className="w-[52px] shrink-0 text-muted">이전글</span>
          {prev ? (
            <Link href={newsViewHref(prev.seq, spage, lpage)} className="truncate !text-ink">
              {prev.title}
            </Link>
          ) : (
            <span className="text-faint">이전글이 없습니다.</span>
          )}
        </li>
        <li className="flex gap-[16px] border-b border-line py-[12px]">
          <span className="w-[52px] shrink-0 text-muted">다음글</span>
          {next ? (
            <Link href={newsViewHref(next.seq, spage, lpage)} className="truncate !text-ink">
              {next.title}
            </Link>
          ) : (
            <span className="text-faint">다음글이 없습니다.</span>
          )}
        </li>
      </ul>

      <div className="mt-[24px] flex justify-end">
        <Link href={listHref} className="btn-outline !h-[38px] !px-[18px] !text-ink hover:bg-ink hover:!text-white hover:!no-underline">
          목록
        </Link>
      </div>
    </div>
  );
}
