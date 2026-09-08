import type { Metadata } from "next";
import Link from "next/link";
import NewsTable from "@/components/admin/NewsTable";
import { BTN, PageHead, Pager } from "@/components/admin/ui";
import { getNews, NEWS_PAGE_SIZE } from "@/lib/news";

export const metadata: Metadata = { title: "공지사항 관리" };

type Props = { searchParams: Promise<{ page?: string }> };

/** 공지사항 관리 (/admin/news) — 목록 + 글쓰기 */
export default async function AdminNews({ searchParams }: Props) {
  const sp = await searchParams;
  const list = await getNews();
  const totalPages = Math.max(1, Math.ceil(list.length / NEWS_PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const rows = list.slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE);

  return (
    <div>
      <PageHead
        eyebrow="Notice"
        title="공지사항 관리"
        desc="고객센터 > 공지사항과 홈 하단 '공지사항' 에 노출됩니다. '공지' 로 표시하면 목록에서 Notice 라벨이 붙습니다."
        action={
          <Link href="/admin/news/edit" className={`${BTN} !no-underline max-pc:w-full`}>
            + 새 글 쓰기
          </Link>
        }
      />
      <NewsTable rows={rows} />
      <Pager page={page} totalPages={totalPages} href={(p) => `/admin/news?page=${p}`} />
    </div>
  );
}
