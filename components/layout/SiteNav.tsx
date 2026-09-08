"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* 메뉴 8개 (홈 / 타이어검색 / 타이어소개 / 중고제품 / 회사소개 / 고객센터 / 후기 / 문의하기) */
const MENU = [
  { href: "/", label: "홈", match: "/", exact: true },
  { href: "/product/tire/searchbysize", label: "타이어검색", match: "/product/tire" },
  { href: "/product/tprodintro", label: "타이어소개", match: "/product/tprodintro" },
  { href: "/product/used", label: "중고제품", match: "/product/used" },
  { href: "/company", label: "회사소개", match: "/company" },
  { href: "/cscenter/news", label: "고객센터", match: "/cscenter" },
  { href: "/review", label: "후기", match: "/review" },
  { href: "/contact", label: "문의하기", match: "/contact" },
] as const;

/**
 * 메뉴바 — 흰 바탕에 위아래 얇은 선, 현재 탭은 글자 아래 2px 잉크색 밑줄
 * - PC: 900px 폭, 8개 균등 분할
 * - 모바일: 가로 스크롤되는 한 줄 탭
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-y border-line bg-white flex justify-center">
      <ul className="w-[900px] h-[54px] flex max-pc:w-full max-pc:h-[48px] max-pc:overflow-x-auto max-pc:px-[6px] max-pc:[scrollbar-width:none]">
        {MENU.map((m) => {
          const active = "exact" in m && m.exact ? pathname === m.match : pathname.startsWith(m.match);
          return (
            <li key={m.href} className="flex-1 max-pc:flex-none">
              <Link
                href={m.href}
                className={`relative flex h-full w-full items-center justify-center font-sans text-[14px] tracking-[-0.01em] hover:!no-underline max-pc:px-[14px] max-pc:whitespace-nowrap ${
                  active ? "!text-ink font-bold" : "!text-graphite font-medium hover:!text-ink"
                }`}
              >
                {m.label}
                {active && <span className="absolute bottom-0 left-1/2 h-[2px] w-[28px] -translate-x-1/2 bg-ink" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
