import type { Metadata } from "next";
import Link from "next/link";
import { PHONE_TEL, SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("중고제품"),
  description: "타이어캠프가 꼼꼼히 선별한 중고 타이어·중고 휠. 원하는 사이즈를 전화나 문의하기로 알려 주시면 재고를 확인해 드립니다.",
};

/**
 * 중고제품 (/product/used)
 * - 상품을 온라인에 올리지 않는다. 재고가 수시로 바뀌므로 전화 또는 문의하기로만 안내한다.
 * - 가운데 정렬: Used → 중고제품 → 설명 → [전화] [문의하기]
 */
export default function UsedPage() {
  return (
    <div className="flex w-full flex-col items-center py-[72px] text-center font-sans max-pc:py-[48px]">
      <p className="eyebrow">Used</p>
      <h1 className="mt-[10px] text-[30px] font-bold leading-[1.2] tracking-[-0.03em] text-ink max-pc:text-[24px]">중고제품</h1>
      <p className="mt-[16px] max-w-[520px] text-[14px] leading-[25px] text-graphite max-pc:text-[13px] max-pc:leading-[22px]">
        꼼꼼히 선별한 중고 타이어와 중고 휠을<br className="hidden max-pc:inline" /> 합리적인 가격에 판매합니다.
        <br />
        차종이나 사이즈를 알려 주시면 바로 확인해 드립니다.
      </p>
      {/* 버튼 두 개: 같은 폭(200px), 모바일에서도 가로로 나란히 (화면 폭을 반씩) */}
      <div className="mt-[28px] flex items-center gap-[10px] max-pc:w-full">
        <a href={PHONE_TEL} className="btn-fill w-[160px] !px-0 hover:!no-underline max-pc:w-1/2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mr-[8px] shrink-0">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6.2 6.2l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
          </svg>
          <span style={{ fontFamily: "var(--font-num)" }}>{SITE.phone}</span>
        </a>
        <Link href="/contact?type=중고 타이어&tire=중고 타이어" className="btn-outline w-[160px] !px-0 !text-ink hover:bg-ink hover:!text-white hover:!no-underline max-pc:w-1/2">
          문의하기
        </Link>
      </div>
    </div>
  );
}
