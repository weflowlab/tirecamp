import Link from "next/link";
import { PHONE_TEL, SITE } from "@/lib/site";

/**
 * 공통 푸터 — 잉크색 바탕, 회색 텍스트
 * (본문 900px 밖으로 배경이 꽉 차도록 w-full, 안쪽만 900px)
 */
export default function SiteFooter() {
  return (
    <footer className="w-full mt-[72px] bg-ink font-sans max-pc:mt-[48px]">
      <div className="mx-auto w-[900px] py-[40px] max-pc:w-full max-pc:px-[16px] max-pc:py-[28px]">
        <div className="flex items-start max-pc:flex-col max-pc:gap-[18px]">
          <div className="w-[262px] max-pc:w-auto">
            <span className="block text-[18px] font-bold tracking-[-0.03em] text-white">{SITE.name}</span>
            <span className="eyebrow mt-[4px] block !text-[#6F6F6F]">{SITE.nameEn}</span>
          </div>
          <div className="flex-1 text-[12px] leading-[22px] text-[#9A9A9A]">
            <p className="text-[12px] text-[#9A9A9A]">
              대표 {SITE.ceo} &nbsp;·&nbsp; 사업자등록번호 {SITE.bizNo} &nbsp;·&nbsp;{" "}
              <a href={PHONE_TEL} className="!text-[#DADADA]" style={{ fontFamily: "var(--font-num)" }}>
                {SITE.phone}
              </a>
            </p>
            <p className="text-[12px] text-[#9A9A9A]">
              {SITE.address} &nbsp;·&nbsp; {SITE.email}
            </p>
            <p className="text-[12px] text-[#9A9A9A]">{SITE.hours.map((h) => `${h.label} ${h.value}`).join(" · ")}</p>
            <p className="mt-[12px] flex items-center gap-[14px] text-[11px] text-[#6F6F6F]" style={{ fontFamily: "var(--font-num)" }}>
              <span>© {SITE.nameEn}. All rights reserved.</span>
              <Link href="/cscenter/personal_info" className="!text-[#9A9A9A] hover:!text-white">
                개인정보처리방침
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
