import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";

/* 원본 <head> 메타 정보 그대로 반영 */
export const metadata: Metadata = {
  title: "타이어공장 - 전브랜드 인터넷가 판매",
  description:
    "양주·의정부 타이어 전문점 타이어공장. 한국, 금호, 넥센, 미쉐린, 피렐리, 콘티넨탈 등 전 브랜드 신품·이월·중고 타이어를 합리적인 가격에 판매합니다.",
  keywords:
    "양주타이어, 의정부타이어, 한국타이어, 금호타이어, 넥센타이어, 피렐리타이어, 미쉐린타이어, 콘티넨탈타이어, 타이어가격",
  openGraph: {
    type: "website",
    title: "타이어공장 | 양주·의정부 타이어 전 브랜드 판매",
    description:
      "한국, 금호, 넥센, 미쉐린, 피렐리, 콘티넨탈 등 전 브랜드 신품·이월·중고 타이어를 합리적인 가격에 판매하는 양주·의정부 타이어 전문점입니다.",
    url: "http://tirekongjang.com/",
  },
};

/*
 * 모든 페이지 공통: 헤더(로고+사이즈검색+메뉴) → 본문(900px 중앙) → 푸터
 * 단, 타이어 상세 팝업(/product/tinfo/*) 은 원본처럼 헤더/푸터 없이 본문만 렌더링해야 하므로
 * 실제 크롬 렌더링은 pathname 을 보는 SiteChrome(클라이언트 컴포넌트)에 위임한다.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="min-h-full flex flex-col items-center">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
