import type { Metadata } from "next";
import InquiryForm from "@/components/contact/InquiryForm";
import PageTitle from "@/components/layout/PageTitle";
import { PHONE_TEL, SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("문의하기"),
};

/* SNS 채널 (URL 이 비어 있으면 표시하지 않음 — lib/site.ts 의 sns 에 입력) */
const CHANNELS = [
  { key: "kakao", label: "카카오톡 채널", desc: "채팅으로 빠르게 문의", url: SITE.sns.kakao },
  { key: "instagram", label: "인스타그램", desc: "매장 소식과 작업 사진", url: SITE.sns.instagram },
  { key: "blog", label: "블로그", desc: "타이어 정보와 이용 안내", url: SITE.sns.blog },
].filter((c) => c.url !== "");

/**
 * 문의하기 (/contact)
 * 좌: 연락처·영업시간·SNS (얇은 선으로 구분) / 우: 문의 폼 (→ /api/inquiries)
 */
export default function ContactPage() {
  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Contact" title="문의하기" sub="타이어 견적, 교체 예약, 중고 타이어 재고 등 궁금한 점을 남겨 주시면 확인 후 연락드립니다." />

      <div className="grid grid-cols-[260px_1fr] gap-[48px] max-pc:grid-cols-1 max-pc:gap-[32px]">
        <aside className="text-[13px] leading-[22px] text-graphite">
          <p className="eyebrow">Call</p>
          <a
            href={PHONE_TEL}
            className="mt-[4px] block text-[26px] font-semibold tracking-[-0.01em] !text-ink hover:!no-underline"
            style={{ fontFamily: "var(--font-num)" }}
          >
            {SITE.phone}
          </a>
          <ul className="mt-[10px] border-t border-line pt-[10px]">
            {SITE.hours.map((h) => (
              <li key={h.label} className="flex justify-between">
                <span className="text-muted">{h.label}</span>
                <span className="text-ink">{h.value}</span>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-[28px]">Email</p>
          <a href={`mailto:${SITE.email}`} className="mt-[4px] block break-all !text-ink">
            {SITE.email}
          </a>

          <p className="eyebrow mt-[28px]">Address</p>
          <p className="mt-[4px] text-ink">{SITE.address}</p>

          {CHANNELS.length > 0 && (
            <>
              <p className="eyebrow mt-[28px]">Channels</p>
              <ul className="mt-[6px] border-t border-line">
                {CHANNELS.map((c) => (
                  <li key={c.key} className="border-b border-line">
                    <a href={c.url} target="_blank" rel="noreferrer" className="flex items-center justify-between py-[10px] hover:!no-underline">
                      <span className="!text-ink">{c.label}</span>
                      <span className="text-[11px] !text-muted">{c.desc} →</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <InquiryForm />
      </div>
    </div>
  );
}
