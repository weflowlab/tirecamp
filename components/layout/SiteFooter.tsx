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
          <div className="w-[220px] shrink-0 max-pc:w-auto">
            <span className="block text-[19px] font-bold tracking-[-0.03em] text-white">{SITE.name}</span>
            <span className="eyebrow mt-[4px] block !text-[#6F6F6F]">{SITE.nameEn}</span>
          </div>
          <div className="min-w-0 flex-1 text-[13px] leading-[22px] text-[#9A9A9A]">
            {/* 항목마다 무엇인지 라벨을 붙이고(굵게 + 한 톤 밝게), 짧은 것끼리 한 줄에 둘씩 묶는다 */}
            <p className="text-[13px] text-[#9A9A9A]">
              <L>대표</L> {SITE.ceo} &nbsp;·&nbsp; <L>사업자등록번호</L> {SITE.bizNo}
            </p>
            <p className="text-[13px] text-[#9A9A9A]">
              <L>전화</L>{" "}
              <a href={PHONE_TEL} className="!text-[#DADADA]" style={{ fontFamily: "var(--font-num)" }}>
                {SITE.phone}
              </a>{" "}
              &nbsp;·&nbsp; <L>주소</L> {SITE.address}
            </p>
            <p className="text-[13px] text-[#9A9A9A]">
              <L>이메일</L> {SITE.email}
            </p>
            <p className="text-[13px] text-[#9A9A9A]">
              <L>영업 시간</L> {SITE.hours.map((h) => `${h.label} ${h.value}`).join(" · ")}
            </p>
            <p className="mt-[12px] flex items-center gap-[14px] text-[12px] text-[#6F6F6F]" style={{ fontFamily: "var(--font-num)" }}>
              <span>© {SITE.nameEn}. All rights reserved.</span>
              <Link href="/cscenter/personal_info" className="!text-[#9A9A9A] hover:!text-white">
                개인정보처리방침
              </Link>
            </p>
          </div>

          {/* 제작사 표기 — PC 는 푸터 오른쪽 위, 모바일은 맨 아래 */}
          <a
            href="https://weflowlab.kr/"
            target="_blank"
            rel="noreferrer"
            className="ml-[16px] inline-flex h-[32px] shrink-0 items-center gap-[7px] rounded-full border border-white/25 px-[15px] text-[13px] !text-[#9A9A9A] transition-colors hover:border-white/60 hover:!text-white hover:!no-underline max-pc:ml-0 max-pc:self-start"
          >
            홈페이지 제작 <b className="font-bold">WEFLOW</b>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <path d="M15 3h6v6M10 14 21 3" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* 푸터 항목 라벨 (대표 · 사업자등록번호 · 전화 …) — 내용과 구분되게 굵게 + 한 톤 밝게 */
function L({ children }: { children: React.ReactNode }) {
  return <b className="font-bold text-[#CFCFCF]">{children}</b>;
}
