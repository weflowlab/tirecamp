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
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      className="w-full h-[51px] flex justify-center"
      style={{ backgroundImage: "url(/jwtsm_comimg/tirekong2000/20260520075104576318.gif)" }}
    >
      <ul className="w-[900px] h-[49px] flex items-center">
        {MENU.map((m, i) =>
          m === "bar" ? (
            <li key={`bar-${i}`} className="flex items-center justify-center">
              <img src="/images/menubar.png" alt="" />
            </li>
          ) : (
            <li
              key={m.href}
              className="w-[150px] h-[49px] flex items-center justify-center"
              style={pathname.startsWith(m.match) ? { backgroundColor: "#c44b1c" } : undefined}
            >
              <Link
                href={m.href}
                className="lword !text-white text-[12pt] font-bold hover:!no-underline"
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
