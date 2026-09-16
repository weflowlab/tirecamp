import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import BusinessJsonLd from "@/components/layout/BusinessJsonLd";
import { SITE, SITE_URL, TITLE_SUFFIX } from "@/lib/site";

/* 사이트 메타 정보 (타이어캠프) — openGraph.images 는 절대 주소여야 카카오톡·페이스북 등이 읽어간다 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE_SUFFIX,
  /* 검색 결과에 보이는 설명 — 한글 80자쯤에서 잘리므로 그 안에 담는다 */
  description: "양주 타이어 전문점 타이어캠프. 신품·이월·중고 타이어를 정직한 가격에, 타이어 교체와 얼라이먼트까지 당일 장착해 드립니다.",
  keywords: "양주타이어, 타이어캠프, 중고타이어, 소형타이어, 한국타이어, 금호타이어, 넥센타이어, 미쉐린타이어, 타이어가격, 타이어교체",
  openGraph: {
    type: "website",
    title: `${SITE.name} | 양주 타이어 전문점`,
    description: "타이어 교체를 투명한 가격으로",
    /* 홈 히어로와 같은 매장 진열대 사진. webp 를 못 읽는 공유 미리보기(카카오톡 등)가 있어 jpg 로 둔다 */
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: `${SITE.name} 매장` }],
  },
  /* 네이버 서치어드바이저 사이트 소유확인 (구글은 DNS TXT 로 확인했으므로 여기 없음) */
  verification: {
    other: { "naver-site-verification": "2ddb9a6002c84ab61345b9e43af0b2eb1782e8e3" },
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
        {/* 업체 정보 구조화 데이터 — 화면에는 안 보이고 검색엔진만 읽는다 */}
        <BusinessJsonLd />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
