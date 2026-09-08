"use client";

import { useState } from "react";
import type { Review } from "@/lib/reviewTypes";

/* 이 글자 수를 넘으면 접어 두고 "더보기" 로 펼침 */
const FOLD_AT = 120;

/**
 * 후기 카드 1장 — 별점 → 차량 유형 라벨 → 본문(길면 접힘 + 더보기) → 이름·차종 / 날짜
 */
export default function ReviewCard({ review: r }: { review: Review }) {
  const [open, setOpen] = useState(false);
  const long = r.content.length > FOLD_AT;

  return (
    <li className="flex flex-col border border-line bg-white p-[22px] transition-colors hover:border-ink">
      <div className="flex items-center justify-between gap-[10px]">
        <Stars n={r.rating} />
        <span className="eyebrow !text-faint">{r.vehicle}</span>
      </div>
      <p className={`mt-[12px] flex-1 whitespace-pre-line text-[14px] leading-[24px] text-graphite ${long && !open ? "line-clamp-5" : ""}`}>{r.content}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-[6px] self-end text-[12px] text-muted underline underline-offset-4 hover:text-ink">
          {open ? "접기" : "더보기"}
        </button>
      )}
      <div className="mt-[16px] flex items-end justify-between gap-[10px] border-t border-line pt-[12px]">
        <p className="min-w-0">
          <span className="text-[14px] font-semibold text-ink">{maskName(r.name)}</span>
          {r.car && <span className="ml-[6px] text-[12px] text-muted">{r.car}</span>}
        </p>
        <span className="shrink-0 text-[11px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
          {r.date}
        </span>
      </div>
    </li>
  );
}

/* 별점 (잉크색 ★ / 연회색 ★) */
function Stars({ n }: { n: number }) {
  return (
    <span className="text-[13px] tracking-[2px]" aria-label={`별점 ${n}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? "text-ink" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

/* 이름 가운데 글자 마스킹 (홍길동 → 홍*동) */
function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}
