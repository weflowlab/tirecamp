import type { Metadata } from "next";
import Link from "next/link";
import ReviewCard from "@/components/review/ReviewCard";
import ReviewForm from "@/components/review/ReviewForm";
import { getReviews, VEHICLE_TYPES } from "@/lib/reviews";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("고객 후기"),
};

/* 후기는 요청 시마다 data/reviews.json 을 읽는다 (새 후기 즉시 반영) */
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type Props = { searchParams: Promise<{ v?: string | string[]; page?: string | string[] }> };

/**
 * 고객 후기 (/review?v=차량유형&page=N) — 12개씩 페이지네이션
 * 타이틀(+ 후기 작성하기 → 하단 폼으로 부드럽게 이동) → 차량 유형 칩 → 후기 카드 3열 → 후기 작성 폼 (#write)
 */
export default async function ReviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.v) ? sp.v[0] : sp.v;
  const selected = (VEHICLE_TYPES as readonly string[]).includes(raw ?? "") ? raw! : "";

  const all = await getReviews();
  const filtered = selected ? all.filter((r) => r.vehicle === selected) : all;
  const count = (v: string) => all.filter((r) => r.vehicle === v).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rawPage = parseInt(String(Array.isArray(sp.page) ? sp.page[0] : sp.page ?? "1"), 10) || 1;
  const page = Math.min(Math.max(1, rawPage), totalPages);
  const reviews = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (p: number) => `/review?${selected ? `v=${encodeURIComponent(selected)}&` : ""}page=${p}`;

  return (
    <div className="w-full font-sans">
      {/* 타이틀 + 작성 버튼 */}
      <div className="mb-[28px] flex items-end justify-between gap-[16px] border-b border-line pb-[24px] pt-[8px] max-pc:mb-[20px] max-pc:flex-col max-pc:items-start max-pc:pb-[18px]">
        <div>
          <p className="eyebrow">Reviews</p>
          <h1 className="mt-[10px] text-[30px] font-bold tracking-[-0.03em] text-ink leading-[1.2] max-pc:text-[24px]">고객 후기</h1>
          <p className="mt-[10px] text-[14px] leading-[24px] text-muted max-pc:text-[13px]">타이어캠프를 이용하신 고객님들의 이야기입니다. 이용 후 소중한 후기를 남겨 주세요.</p>
        </div>
        <a href="#write" className="btn-fill shrink-0 !h-[42px] max-pc:w-full">
          후기 작성하기
        </a>
      </div>

      {/* 차량 유형 칩 (전체 + 유형별, 개수 표시) */}
      <div className="mb-[20px] flex flex-wrap gap-[6px]">
        <Chip href="/review" active={selected === ""}>
          전체 <Count n={all.length} />
        </Chip>
        {VEHICLE_TYPES.map((v) => (
          <Chip key={v} href={`/review?v=${encodeURIComponent(v)}`} active={selected === v}>
            {v} <Count n={count(v)} />
          </Chip>
        ))}
      </div>

      {/* 후기 카드 3열 */}
      {reviews.length === 0 ? (
        <p className="border border-dashed border-line py-[48px] text-center text-[13px] text-muted">
          {selected ? `${selected} 후기가 아직 없습니다.` : "아직 등록된 후기가 없습니다. 첫 번째 후기를 남겨 주세요."}
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-[12px] max-pc:grid-cols-1">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      )}

      {/* 페이지 번호 (2페이지 이상일 때만) */}
      {totalPages > 1 && (
        <nav className="mt-[28px] flex justify-center gap-[4px]" style={{ fontFamily: "var(--font-num)" }} aria-label="후기 페이지">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              scroll={false}
              className={`flex h-[34px] min-w-[34px] items-center justify-center px-[8px] text-[13px] hover:!no-underline ${
                p === page ? "border-b-2 border-ink font-bold !text-ink" : "!text-muted hover:!text-ink"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}

      {/* 후기 작성 */}
      <section id="write" className="mt-[64px] scroll-mt-[24px] border-t border-line pt-[40px] max-pc:mt-[44px] max-pc:pt-[28px]">
        <div className="grid grid-cols-[180px_1fr] gap-[24px] max-pc:grid-cols-1 max-pc:gap-[12px]">
          <div>
            <p className="eyebrow">Write</p>
            <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">후기 작성</h2>
          </div>
          <ReviewForm />
        </div>
      </section>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`inline-flex h-[32px] items-center border px-[12px] text-[12px] transition-colors hover:!no-underline ${
        active ? "border-ink bg-ink !text-white" : "border-line bg-white !text-graphite hover:border-graphite hover:!text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-[4px] opacity-60" style={{ fontFamily: "var(--font-num)" }}>
      {n}
    </span>
  );
}
