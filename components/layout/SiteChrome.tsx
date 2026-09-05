"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * 공통 크롬(헤더/본문 폭/푸터) 스위치
 *
 * 원본 사이트는 대부분의 페이지가 헤더+메뉴+푸터를 가진 900px 레이아웃이지만,
 * 타이어 상세 팝업(/product/tinfo/view.aspx, window.open 795x675)은 헤더/메뉴/푸터가 전혀 없는
 * 맨 페이지다. app/layout.tsx 는 모든 라우트에 적용되므로, 여기서 pathname 을 보고
 *   - /product/tinfo/ 로 시작하면 children 만 그대로 (팝업)
 *   - 그 외에는 SiteHeader → <main 900px> → SiteFooter
 * 로 분기한다. (다른 페이지 폴더를 route group 으로 옮기지 않기 위한 방식)
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 팝업 계열: 크롬 없이 본문만
  if (pathname.startsWith("/product/tinfo/")) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {/* 원본은 메뉴 아래 15px 여백 후 900px 폭 본문. 모바일은 화면 폭 - 좌우 10px */}
      <main className="w-full max-w-[900px] pt-[15px] max-pc:px-[10px]">{children}</main>
      <SiteFooter />
    </>
  );
}
