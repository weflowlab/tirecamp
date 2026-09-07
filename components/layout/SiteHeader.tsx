import Link from "next/link";
import QuickSizeSearch from "./QuickSizeSearch";
import SiteNav from "./SiteNav";
import { PHONE_TEL, SITE } from "@/lib/site";

/**
 * 공통 헤더 — 여백을 넓게, 요소는 작고 정갈하게
 * - 1행: 작은 유틸 링크 (우측)
 * - 2행: 텍스트 로고 | 사이즈 빠른검색 | 전화번호·영업시간
 * - 3행: 메뉴바 (SiteNav)
 *
 * 모바일(<920px): [로고 | 전화] 한 줄 → 사이즈검색 한 줄 → 가로 스크롤 메뉴
 * 로고 이미지는 고객에게 파일을 받으면 텍스트 로고 자리에 교체한다.
 */
export default function SiteHeader() {
  return (
    <header className="w-full font-sans">
      <div className="mx-auto w-[900px] max-pc:w-full max-pc:px-[16px]">
        {/* 상단 작은 유틸 링크 */}
        <div className="h-[34px] flex justify-end items-center max-pc:h-[30px]">
          <ul className="flex gap-[20px] text-[11px] tracking-[0.04em]">
            {[
              { href: "/", label: "HOME" },
              { href: "/cscenter/news", label: "고객센터" },
              { href: "/contact", label: "문의하기" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="!text-muted hover:!text-ink hover:!no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 로고 / 사이즈검색 / 전화 */}
        <div className="flex h-[96px] items-center max-pc:h-auto max-pc:flex-wrap max-pc:justify-between max-pc:pb-[14px]">
          <div className="w-[340px] max-pc:w-[56%] max-pc:order-1">
            <Link href="/" className="inline-block hover:!no-underline">
              <span className="block text-[26px] font-bold leading-[1] tracking-[-0.04em] !text-ink">{SITE.name}</span>
              <span className="eyebrow mt-[6px] block !text-faint">{SITE.nameEn}</span>
            </Link>
          </div>
          <div className="w-[325px] flex justify-center max-pc:w-full max-pc:order-3 max-pc:pt-[10px]">
            <QuickSizeSearch />
          </div>
          <div className="w-[235px] flex flex-col items-end justify-center max-pc:w-[40%] max-pc:order-2">
            <span className="eyebrow">Call</span>
            <a
              href={PHONE_TEL}
              className="mt-[2px] text-[22px] font-semibold leading-[1.1] tracking-[-0.01em] !text-ink hover:!no-underline max-pc:text-[18px]"
              style={{ fontFamily: "var(--font-num)" }}
            >
              {SITE.phone}
            </a>
            <span className="mt-[6px] text-[11px] leading-[15px] text-muted text-right max-pc:hidden">평일 09–19 · 토 09–18 · 일 휴무</span>
          </div>
        </div>
      </div>

      <SiteNav />
    </header>
  );
}
