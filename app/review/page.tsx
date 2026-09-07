import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import ReviewForm from "@/components/review/ReviewForm";
import { getReviews } from "@/lib/reviews";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("고객 후기"),
};

/* 후기는 요청 시마다 data/reviews.json 을 읽는다 (새 후기 즉시 반영) */
export const dynamic = "force-dynamic";

/**
 * 고객 후기 (/review)
 * 타이틀 → 후기 목록(최신순) → 후기 작성 폼
 */
export default async function ReviewPage() {
  const reviews = await getReviews();

  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Reviews" title="고객 후기" sub="타이어캠프를 이용하신 고객님들의 이야기입니다. 이용 후 소중한 후기를 남겨 주세요." />

      <ul>
        {reviews.length === 0 && (
          <li className="border-b border-line py-[40px] text-center text-[13px] text-muted">아직 등록된 후기가 없습니다. 첫 번째 후기를 남겨 주세요.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="grid grid-cols-[180px_1fr] gap-[24px] border-b border-line py-[24px] max-pc:grid-cols-1 max-pc:gap-[8px]">
            <div>
              <Stars n={r.rating} />
              <p className="mt-[8px] text-[14px] font-semibold text-ink">
                {maskName(r.name)}
                {r.car && <span className="ml-[8px] text-[12px] font-normal text-muted">{r.car}</span>}
              </p>
              <p className="mt-[2px] text-[12px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
                {r.date}
              </p>
            </div>
            <p className="whitespace-pre-line text-[14px] leading-[25px] text-graphite">{r.content}</p>
          </li>
        ))}
      </ul>

      <section className="mt-[56px] grid grid-cols-[180px_1fr] gap-[24px] max-pc:grid-cols-1 max-pc:gap-[12px]">
        <div>
          <p className="eyebrow">Write</p>
          <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">후기 작성</h2>
        </div>
        <ReviewForm />
      </section>
    </div>
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
