import type { Metadata } from "next";
import Link from "next/link";
import faqData from "@/data/faq.json";
import { pageTitle, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("자주 묻는 질문"),
};

type Faq = { q: string; a: string };
const FAQS = faqData as Faq[];

/**
 * 자주 묻는 질문 (/cscenter/tfaq)
 * - 번호 + 질문 아코디언(details). 내용은 data/faq.json (관리자 페이지에서 수정 예정)
 */
export default function FaqPage() {
  return (
    <div className="w-full font-sans">
      <p className="eyebrow">FAQ</p>
      <h1 className="mt-[4px] mb-[24px] text-[24px] font-bold tracking-[-0.03em] text-ink max-pc:text-[20px]">자주 묻는 질문</h1>

      <ul className="border-t border-line">
        {FAQS.map((f, i) => (
          <li key={i} className="border-b border-line">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-start gap-[20px] py-[18px] text-[15px] font-medium text-ink hover:text-graphite [&::-webkit-details-marker]:hidden max-pc:gap-[14px] max-pc:text-[14px]">
                <span className="eyebrow shrink-0 pt-[4px] !text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 leading-[24px]">{f.q}</span>
                <span className="shrink-0 pt-[2px] text-[18px] font-light text-faint transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-[22px] pl-[40px] pr-[30px] text-[14px] leading-[25px] text-graphite max-pc:pl-[34px] max-pc:pr-0">
                <p className="whitespace-pre-line text-[14px] text-graphite">{f.a}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <p className="mt-[24px] text-[13px] text-muted">
        찾는 답이 없으신가요?{" "}
        <Link href="/contact" className="!text-ink underline underline-offset-4">
          문의하기
        </Link>{" "}
        또는 <span style={{ fontFamily: "var(--font-num)" }}>{SITE.phone}</span> 로 연락 주세요.
      </p>
    </div>
  );
}
