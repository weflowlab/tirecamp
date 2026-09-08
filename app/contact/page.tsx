import type { Metadata } from "next";
import { Suspense } from "react";
import InquiryForm from "@/components/contact/InquiryForm";
import PageTitle from "@/components/layout/PageTitle";
import { MAP_LINKS, PHONE_TEL, SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("문의하기"),
};

/* SNS 채널 (URL 이 비어 있으면 표시하지 않음 — lib/site.ts 의 sns 에 입력) */
const CHANNELS = [
  { key: "kakao", label: "카카오톡 채널", desc: "채팅으로 빠르게 문의", url: SITE.sns.kakao },
  { key: "instagram", label: "인스타그램", desc: "매장 소식과 작업 사진", url: SITE.sns.instagram },
  { key: "blog", label: "블로그", desc: "타이어 정보와 이용 안내", url: SITE.sns.blog },
].filter((c) => c.url !== "");

/* 문의 후 진행 안내 */
const STEPS: [string, string][] = [
  ["문의 접수", "폼을 남기시면 바로 접수됩니다."],
  ["확인 연락", "영업시간 내에 전화로 연락드립니다."],
  ["방문 · 장착", "예약한 날짜에 매장에서 장착합니다."],
];

/**
 * 문의하기 (/contact)
 * 타이틀 → [진행 안내 · SNS | 문의 폼 카드] → 차콜 연락처 카드(전화 · 영업시간 · 오시는 길)
 */
export default function ContactPage() {
  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Contact" title="문의하기" sub="타이어 견적, 교체 예약, 중고 타이어 재고 등 궁금한 점을 남겨 주시면 확인 후 연락드립니다." />


      {/* 폼 + 안내 */}
      <div className="grid grid-cols-[260px_1fr] gap-[12px] max-pc:grid-cols-1">
        <aside className="flex flex-col gap-[12px] max-pc:hidden">
          <div className="flex flex-1 flex-col border border-line bg-white px-[24px] py-[32px] max-pc:flex-none max-pc:p-[18px]">
            <p className="eyebrow">How it works</p>
            <h3 className="mt-[4px] text-[16px] font-bold tracking-[-0.01em] text-ink">이렇게 진행돼요</h3>
            <ol className="mt-[10px] flex flex-1 flex-col">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex flex-1 items-center gap-[12px] border-t border-line py-[12px] first:border-t-0">
                  <span className="eyebrow mt-[3px] shrink-0 !text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{t}</p>
                    <p className="mt-[2px] whitespace-nowrap text-[11px] leading-[17px] tracking-[-0.02em] text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {CHANNELS.length > 0 && (
            <div className="border border-line bg-white p-[24px] max-pc:p-[18px]">
              <p className="eyebrow">Channels</p>
              <ul className="mt-[8px]">
                {CHANNELS.map((c) => (
                  <li key={c.key} className="border-t border-line first:border-t-0">
                    <a href={c.url} target="_blank" rel="noreferrer" className="flex items-center justify-between py-[10px] hover:!no-underline">
                      <span className="text-[13px] font-medium !text-ink">{c.label}</span>
                      <span className="text-[11px] !text-muted">{c.desc} →</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-surface p-[24px] text-[12px] leading-[19px] text-graphite max-pc:p-[18px]">
            급하신 경우 전화가 가장 빠릅니다.
            <br />
            영업시간 외 문의는 다음 영업일에
            <br />
            순서대로 연락드립니다.
          </div>
        </aside>

        <section className="border border-line bg-white p-[32px] max-pc:p-[18px]">
          <p className="eyebrow">Message</p>
          <h2 className="mt-[4px] mb-[20px] text-[20px] font-bold tracking-[-0.02em] text-ink">문의 남기기</h2>
          {/* useSearchParams(?tire= 미리 채움) 사용 → Suspense 경계 필요 */}
          <Suspense fallback={null}>
            <InquiryForm />
          </Suspense>
        </section>
      </div>

      {/* 연락처 카드 */}
      <section className="relative mt-[12px] overflow-hidden bg-charcoal text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="relative grid grid-cols-3 max-pc:grid-cols-1">
          <div className="px-[32px] py-[30px] max-pc:px-[20px] max-pc:py-[22px]">
            <p className="eyebrow !text-[#8C8C8C]">Call</p>
            <a href={PHONE_TEL} className="mt-[8px] block text-[26px] font-semibold leading-[34px] tracking-[-0.01em] !text-white hover:!no-underline max-pc:text-[24px]" style={{ fontFamily: "var(--font-num)" }}>
              {SITE.phone}
            </a>
            <p className="mt-[8px] text-[12px] text-[#B8B8B8]">견적 · 예약 · 중고 타이어 문의</p>
          </div>
          <div className="border-l border-[#333] px-[32px] py-[30px] max-pc:border-l-0 max-pc:border-t max-pc:px-[20px] max-pc:py-[22px]">
            <p className="eyebrow !text-[#8C8C8C]">Hours</p>
            <ul className="mt-[8px] text-[13px] leading-[22px] pt-[2px]">
              {SITE.hours.map((h) => (
                <li key={h.label} className="flex gap-[14px]">
                  <span className="w-[44px] text-[#B8B8B8]">{h.label}</span>
                  <span className="text-white">{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-l border-[#333] px-[32px] py-[30px] max-pc:border-l-0 max-pc:border-t max-pc:px-[20px] max-pc:py-[22px]">
            <p className="eyebrow !text-[#8C8C8C]">Location</p>
            <p className="mt-[8px] text-[15px] font-medium leading-[34px] text-white">{SITE.address}</p>
            <p className="mt-[8px] flex gap-[14px] text-[12px]">
              <a href={MAP_LINKS.naver} target="_blank" rel="noreferrer" className="!text-[#B8B8B8] underline underline-offset-4 hover:!text-white">
                네이버지도
              </a>
              <a href={MAP_LINKS.kakao} target="_blank" rel="noreferrer" className="!text-[#B8B8B8] underline underline-offset-4 hover:!text-white">
                카카오맵
              </a>
              <a href={`mailto:${SITE.email}`} className="!text-[#B8B8B8] underline underline-offset-4 hover:!text-white">
                이메일
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
