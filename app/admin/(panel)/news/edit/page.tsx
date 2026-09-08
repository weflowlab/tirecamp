import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsForm from "@/components/admin/NewsForm";
import { PageHead } from "@/components/admin/ui";
import { findNews } from "@/lib/news";

export const metadata: Metadata = { title: "공지사항 작성" };

type Props = { searchParams: Promise<{ seq?: string }> };

/** 공지 쓰기/수정 (/admin/news/edit?seq=N) */
export default async function AdminNewsEdit({ searchParams }: Props) {
  const sp = await searchParams;
  const seq = parseInt(sp.seq ?? "", 10);
  const item = Number.isFinite(seq) ? await findNews(seq) : undefined;
  if (sp.seq && !item) notFound();

  return (
    <div>
      <PageHead back={{ href: "/admin/news", label: "공지 목록으로" }} eyebrow="Notice" title={item ? "공지사항 수정" : "새 공지사항"} desc={item ? `No. ${item.seq} · 작성일 ${item.date}` : "제목과 내용을 입력하고 저장하면 바로 사이트에 노출됩니다."} />
      <NewsForm item={item ?? null} />
    </div>
  );
}
