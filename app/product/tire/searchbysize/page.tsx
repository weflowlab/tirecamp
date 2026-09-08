import type { Metadata } from "next";
import FindTireBox from "@/components/tire/FindTireBox";
import OrderSteps from "@/components/tire/OrderSteps";
import PageTitle from "@/components/layout/PageTitle";
import Link from "next/link";
import { getTire } from "@/lib/tires";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("타이어검색"),
};

/* 선택 타이어 정보는 DB 에서 읽는다 */
export const dynamic = "force-dynamic";

/**
 * 타이어검색 탭 (/product/tire/searchbysize)
 * 타이틀 → 검색 카드(차량/사이즈검색) → 이용 안내
 */
export default async function SearchBySizePage({ searchParams }: { searchParams: Promise<{ tire?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.tire) ? sp.tire[0] : sp.tire;
  const tinfo = raw && /^\d+$/.test(raw) ? raw : undefined;
  const picked = tinfo ? await getTire(tinfo) : undefined;

  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Tire Search" title="타이어검색" sub="차종을 선택하거나 타이어 옆면의 사이즈(예: 205/55R16)를 입력해 가격을 확인하세요." />

      {/* 타이어소개에서 "내 차 사이즈로 가격 검색" 으로 넘어온 경우 */}
      {picked && (
        <div className="mb-[12px] flex items-center gap-[14px] border border-ink px-[18px] py-[12px] max-pc:flex-wrap">
          <img src={picked.image} alt="" className="img-fixed h-[44px] w-auto" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Selected</p>
            <p className="text-[14px] font-semibold text-ink">
              {picked.brandName} {picked.model}
            </p>
          </div>
          <p className="text-[12px] text-muted">차종이나 사이즈를 고르면 이 타이어의 가격을 먼저 보여드립니다.</p>
          <Link href="/product/tire/searchbysize" className="text-[12px] !text-muted underline underline-offset-4 hover:!text-ink">
            선택 해제
          </Link>
        </div>
      )}

      <FindTireBox variant="tire" tinfo={tinfo} />

      <div className="mt-[48px] max-pc:mt-[36px]">
        <OrderSteps />
      </div>
    </div>
  );
}
