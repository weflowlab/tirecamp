import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/lib/faq";
import { pageTitle, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("자주 묻는 질문"),
};

/* 요청 시마다 data/faq.json 을 읽는다 (관리자 수정 즉시 반영) */
export const dynamic = "force-dynamic";

/**
 * 자주 묻는 질문 (/cscenter/tfaq)
 * - 번호 + 질문 아코디언(details). 내용은 data/faq.json (관리자 페이지 > FAQ 관리에서 수정)
 */
export default async function FaqPage() {
  const FAQS = await getFaqs();
  return (
    <div className="w-full font-sans">
      <p className="eyebrow">FAQ</p>
      <h1 className="mt-[4px] mb-[24px] text-[24px] font-bold tracking-[-0.03em] text-ink max-pc:text-[20px]">자주 묻는 질문</h1>

      <ul className="border-t border-line">
        {FAQS.map((f, i) => (
          <li key={i} className="border-b border-line">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-[20px] py-[18px] text-[15px] font-medium text-ink hover:text-graphite [&::-webkit-details-marker]:hidden max-pc:gap-[14px] max-pc:text-[14px]">
                <span className="eyebrow relative -top-px shrink-0 leading-none !text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 leading-[24px]">{f.q}</span>
                <span className="shrink-0 text-[18px] font-light leading-none text-faint transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-[22px] pl-[40px] pr-[30px] text-[14px] leading-[25px] text-graphite max-pc:pl-[34px] max-pc:pr-0">
                <p className="whitespace-pre-line text-[14px] text-graphite">{f.a}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <p className="mt-[24px] text-[13px] leading-[22px] text-muted max-pc:text-center">
        찾는 답이 없으신가요?
        <br className="hidden max-pc:inline" />{" "}
        <Link href="/contact" className="!text-ink underline underline-offset-4">
          문의하기
        </Link>{" "}
        또는 <span style={{ fontFamily: "var(--font-num)" }}>{SITE.phone}</span> 로 연락 주세요.
      </p>
    </div>
  );
}
