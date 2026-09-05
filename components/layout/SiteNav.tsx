"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* 메뉴 항목 (원본 순서 그대로). 중고제품은 원본 링크만 유지 */
const MENU = [
  { href: "/product/tire/searchbysize", label: "타이어", match: "/product/tire" },
  { href: "/product/tprodintro", label: "타이어소개", match: "/product/tprodintro" },
  { href: "/shop/shopintro", label: "매장소개", match: "/shop" },
  "bar",
  { href: "/comevent/oevent", label: "이벤트", match: "/comevent" },
  { href: "http://tirekongjang.com/product/used/bmusedwt_list.aspx", label: "중고제품", match: "/product/used" },
  "bar",
  { href: "/cscenter/news", label: "고객센터", match: "/cscenter" },
] as const;

/**
 * 갈색 배경 메뉴바 (원본 background gif 51px 높이, 900px 폭 테이블)
 * - 현재 탭은 bgcolor #c44b1c 로 강조 (원본 서브페이지 동작)
 * - 메뉴 사이 구분 이미지 menubar.png
 * - 모바일: 구분 이미지는 숨기고 6개 메뉴를 3열 2행 그리드로 (배경 gif 는 10x51 세로 그라데이션이라 행마다 반복)
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      className="w-full h-[51px] flex justify-center max-pc:h-auto"
      style={{ backgroundImage: "url(/jwtsm_comimg/tirekong2000/20260520075104576318.gif)" }}
    >
      <ul className="w-[900px] h-[49px] flex items-center max-pc:w-full max-pc:h-auto max-pc:grid max-pc:grid-cols-3">
        {MENU.map((m, i) =>
          m === "bar" ? (
            <li key={`bar-${i}`} className="flex items-center justify-center max-pc:hidden">
              <img src="/images/menubar.png" alt="" className="img-fixed" />
            </li>
          ) : (
            <li
              key={m.href}
              className="w-[150px] h-[49px] flex items-center justify-center max-pc:w-auto max-pc:h-[46px]"
              style={pathname.startsWith(m.match) ? { backgroundColor: "#c44b1c" } : undefined}
            >
              <Link
                href={m.href}
                className="lword !text-white text-[12pt] font-bold hover:!no-underline max-pc:flex max-pc:w-full max-pc:h-full max-pc:items-center max-pc:justify-center"
                style={{ fontFamily: "돋움, 'Nanum Gothic', sans-serif" }}
              >
                {m.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
