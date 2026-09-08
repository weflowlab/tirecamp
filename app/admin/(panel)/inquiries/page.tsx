import type { Metadata } from "next";
import InquiryManager from "@/components/admin/InquiryManager";
import { Chip, PageHead, Pager } from "@/components/admin/ui";
import { INQUIRIES_FILE, type Inquiry } from "@/lib/inquiries";
import { readList } from "@/lib/store";

export const metadata: Metadata = { title: "문의 관리" };

const PAGE_SIZE = 20;

type Props = { searchParams: Promise<{ status?: string; q?: string; page?: string; open?: string }> };

/**
 * 문의 관리 (/admin/inquiries?status=new|done&q=검색어&page=N&open=id)
 * - 상태 칩 + 검색 → 목록(펼치면 내용/메모/처리 버튼) → 페이지 번호
 */
export default async function AdminInquiries({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status === "new" || sp.status === "done" ? sp.status : "";
  const q = (sp.q ?? "").trim();
  const openId = Number(sp.open) || 0;

  const all = (await readList<Inquiry>(INQUIRIES_FILE)).sort((a, b) => b.id - a.id);
  const filtered = all.filter((i) => (!status || i.status === status) && (!q || [i.name, i.phone, i.car, i.content, i.memo ?? ""].some((v) => v.includes(q))));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const query = (over: Record<string, string | number>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | number> = { status, q, page: 1, ...over };
    if (merged.status) p.set("status", String(merged.status));
    if (merged.q) p.set("q", String(merged.q));
    if (merged.page && Number(merged.page) > 1) p.set("page", String(merged.page));
    const s = p.toString();
    return `/admin/inquiries${s ? `?${s}` : ""}`;
  };
  const count = (s: "" | "new" | "done") => all.filter((i) => !s || i.status === s).length;

  return (
    <div>
      <PageHead eyebrow="Inquiries" title="문의 관리" desc="문의하기 폼으로 접수된 문의입니다. 처리 후 완료로 바꾸고, 메모를 남겨 두세요." />

      <div className="mb-[16px] flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch">
        <div className="flex flex-wrap gap-[6px]">
          {(
            [
              ["", "전체"],
              ["new", "신규"],
              ["done", "처리완료"],
            ] as const
          ).map(([s, label]) => (
            <Chip key={s} href={query({ status: s, page: 1 })} active={status === s}>
              {label}
              <span className="ml-[4px] opacity-60" style={{ fontFamily: "var(--font-num)" }}>
                {count(s)}
              </span>
            </Chip>
          ))}
        </div>
        <form method="get" className="flex gap-[6px]">
          {status && <input type="hidden" name="status" value={status} />}
          <input type="search" name="q" defaultValue={q} placeholder="이름·연락처·내용 검색" className="field !h-[30px] !w-[220px] !text-[12px] max-pc:!h-[36px] max-pc:min-w-0 max-pc:flex-1 max-pc:!w-auto" />
          <button type="submit" className="btn-outline !h-[30px] shrink-0 whitespace-nowrap !px-[12px] !text-[12px] text-ink hover:bg-ink hover:text-white max-pc:!h-[36px]">
            검색
          </button>
        </form>
      </div>

      <InquiryManager rows={rows} openId={openId} />
      <Pager page={page} totalPages={totalPages} href={(p) => query({ page: p })} />
    </div>
  );
}
