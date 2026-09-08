import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { SITE, TITLE_SUFFIX } from "@/lib/site";

/* 사이트 메타 정보 (타이어캠프) */
export const metadata: Metadata = {
  title: TITLE_SUFFIX,
  description:
    "양주 타이어 전문점 타이어캠프. 한국, 금호, 넥센, 미쉐린, 피렐리, 콘티넨탈 등 국산·수입 전 브랜드 신품 타이어와 중고 타이어를 합리적인 가격에 판매합니다.",
  keywords: "양주타이어, 타이어캠프, 중고타이어, 소형타이어, 한국타이어, 금호타이어, 넥센타이어, 미쉐린타이어, 타이어가격, 타이어교체",
  openGraph: {
    type: "website",
    title: `${SITE.name} | 양주 타이어 전문점`,
    description: "국산·수입 전 브랜드 신품 타이어와 중고 타이어를 합리적인 가격에 판매하는 양주 타이어 전문점입니다.",
  },
};

/*
 * 모든 페이지 공통: 헤더(로고+사이즈검색+메뉴) → 본문(900px 중앙) → 푸터
 * 단, 타이어 상세 팝업(/product/tinfo/*) 은 원본처럼 헤더/푸터 없이 본문만 렌더링해야 하므로
 * 실제 크롬 렌더링은 pathname 을 보는 SiteChrome(클라이언트 컴포넌트)에 위임한다.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col items-center">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
