"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { newsPreview, newsViewHref, type NewsItem } from "@/lib/newsTypes";
import { Badge, BTN_DANGER, BTN_TEXT, Empty, NUM, TABLE, TD, TH, TR_HOVER } from "./ui";

/** 공지 목록 (클라이언트) — 공지 표시 토글 / 수정 / 삭제 */
export default function NewsTable({ rows }: { rows: NewsItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function toggleNotice(n: NewsItem) {
    setBusy(n.seq);
    await fetch(`/api/admin/news/${n.seq}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notice: !n.notice }) }).catch(() => {});
    setBusy(null);
    router.refresh();
  }

  async function remove(n: NewsItem) {
    if (!confirm(`"${n.title}" 글을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusy(n.seq);
    await fetch(`/api/admin/news/${n.seq}`, { method: "DELETE" }).catch(() => {});
    setBusy(null);
    router.refresh();
  }

  if (rows.length === 0) return <Empty>등록된 공지사항이 없습니다.</Empty>;

  return (
    <div className="overflow-x-auto border-t border-ink bg-white">
      <table className={TABLE}>
        <thead>
          <tr>
            <th className={TH}>No.</th>
            <th className={TH}>구분</th>
            <th className={`${TH} w-full`}>제목</th>
            <th className={TH}>작성일</th>
            <th className={TH}>조회</th>
            <th className={TH}>관리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.seq} className={TR_HOVER}>
              <td className={`${TD} text-faint`} style={NUM}>
                {n.seq}
              </td>
              <td className={TD}>
                <button type="button" disabled={busy === n.seq} onClick={() => toggleNotice(n)} title="눌러서 공지 표시 전환" className="disabled:opacity-40">
                  <Badge tone={n.notice ? "ink" : "faint"}>{n.notice ? "공지" : "일반"}</Badge>
                </button>
              </td>
              <td className={`${TD} max-w-[420px]`}>
                <Link href={`/admin/news/edit?seq=${n.seq}`} className="block truncate text-[14px] font-medium !text-ink hover:!text-graphite">
                  {n.title}
                </Link>
                <span className="mt-[2px] block truncate text-[12px] text-muted">{newsPreview(n.content).replace(/\n/g, " ")}</span>
              </td>
              <td className={`${TD} whitespace-nowrap text-faint`} style={NUM}>
                {n.date}
              </td>
              <td className={`${TD} text-faint`} style={NUM}>
                {n.views}
              </td>
              <td className={`${TD} whitespace-nowrap`}>
                <div className="flex gap-[12px]">
                  <Link href={`/admin/news/edit?seq=${n.seq}`} className={`${BTN_TEXT} !text-muted hover:!text-ink`}>
                    수정
                  </Link>
                  <Link href={newsViewHref(n.seq)} target="_blank" className={`${BTN_TEXT} !text-muted hover:!text-ink`}>
                    보기
                  </Link>
                  <button type="button" disabled={busy === n.seq} className={BTN_DANGER} onClick={() => remove(n)}>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
