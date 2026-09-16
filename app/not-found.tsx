import type { Metadata } from "next";
import Link from "next/link";
import { PHONE_TEL, SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("페이지를 찾을 수 없습니다"),
  robots: { index: false, follow: true },
};

/* 자주 찾는 곳 — 주소를 잘못 들어온 손님이 바로 갈 만한 곳만 */
const LINKS: [string, string, string][] = [
  ["/product/tire/searchbysize", "타이어검색", "차종 · 사이즈로 찾기"],
  ["/product/used", "중고제품", "중고 타이어 · 휠 재고 문의"],
  ["/company", "회사소개", "매장 정보 · 오시는 길"],
  ["/cscenter/news", "고객센터", "공지사항 · 자주 묻는 질문"],
];

/**
 * 404 (없는 주소로 들어왔을 때)
 * - 헤더/푸터는 SiteChrome 이 그대로 씌워 주므로 본문만 그린다.
 * - 막다른 길로 두지 않고 [홈으로] [전화] + 자주 찾는 곳 4칸으로 되돌려 보낸다.
 */
export default function NotFound() {
  return (
    <div className="w-full py-[64px] text-center font-sans max-pc:py-[40px]">
      <p className="text-[72px] font-bold leading-none tracking-[-0.04em] text-line max-pc:text-[56px]" style={{ fontFamily: "var(--font-num)" }}>
        404
      </p>
      <h1 className="mt-[20px] text-[26px] font-bold leading-[1.3] tracking-[-0.03em] text-ink max-pc:text-[21px]">페이지를 찾을 수 없습니다</h1>
      <p className="mt-[12px] text-[15px] leading-[25px] text-graphite max-pc:text-[14px] max-pc:leading-[22px]">주소가 바뀌었거나 삭제된 페이지입니다.</p>

      <div className="mt-[28px] flex items-center justify-center gap-[10px] max-pc:w-full">
        <Link href="/" className="btn-fill w-[160px] !px-0 hover:!no-underline max-pc:w-1/2">
          홈으로
        </Link>
        <a href={PHONE_TEL} className="btn-outline w-[160px] !px-0 !text-ink hover:bg-ink hover:!text-white hover:!no-underline max-pc:w-1/2">
          <span style={{ fontFamily: "var(--font-num)" }}>{SITE.phone}</span>
        </a>
      </div>

      {/* 자주 찾는 곳 — 얇은 선으로만 나눈 4칸 (모바일 2칸) */}
      <ul className="mt-[48px] grid grid-cols-4 border-y border-line text-left max-pc:mt-[32px] max-pc:grid-cols-2">
        {LINKS.map(([href, title, desc], i) => (
          <li
            key={href}
            className={`${i < 3 ? "border-r border-line" : ""} max-pc:[&:nth-child(2)]:border-r-0 max-pc:[&:nth-child(-n+2)]:border-b max-pc:[&:nth-child(-n+2)]:border-line`}
          >
            <Link href={href} className="block h-full px-[20px] py-[22px] transition-colors hover:bg-surface hover:!no-underline max-pc:px-[14px] max-pc:py-[18px]">
              <p className="text-[16px] font-bold tracking-[-0.02em] !text-ink max-pc:text-[15px]">{title}</p>
              <p className="mt-[4px] text-[13px] leading-[19px] !text-muted max-pc:text-[12px]">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
