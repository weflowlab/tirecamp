"use client";

/**
 * 페이지 번호 — 현재 페이지는 잉크색 밑줄 + 굵게, 나머지는 회색
 */
export default function Paginator({ page, totalPages, onMove }: { page: number; totalPages: number; onMove: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-[32px] flex flex-wrap justify-center gap-[4px]" style={{ fontFamily: "var(--font-num)" }}>
      {pages.map((p) => (
        <a
          key={p}
          href={`?page=${p}`}
          onClick={(e) => {
            e.preventDefault();
            onMove(p);
          }}
          className={`flex h-[34px] min-w-[34px] items-center justify-center px-[8px] text-[13px] hover:!no-underline ${
            p === page ? "border-b-2 border-ink font-bold !text-ink" : "!text-muted hover:!text-ink"
          }`}
        >
          {p}
        </a>
      ))}
    </div>
  );
}
