"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* 고객센터 좌측 서브메뉴: 공지 / FAQ / 개인정보처리방침 */
const ITEMS = [
  { href: "/cscenter/news", label: "공지사항", match: "/cscenter/news" },
  { href: "/cscenter/tfaq", label: "자주 묻는 질문", match: "/cscenter/tfaq" },
  { href: "/cscenter/personal_info", label: "개인정보처리방침", match: "/cscenter/personal_info" },
];

/**
 * 고객센터 좌측 메뉴 — 얇은 텍스트 목록, 현재 항목은 굵게 + 좌측 2px 선
 * - 모바일: 가로 나열
 */
export default function CsSideMenu() {
  const pathname = usePathname();

  return (
    <ul className="w-[170px] font-sans max-pc:flex max-pc:w-full max-pc:gap-[18px] max-pc:border-b max-pc:border-line max-pc:pb-[12px]">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.match);
        return (
          <li key={item.href} className="mb-[2px] max-pc:mb-0">
            <Link
              href={item.href}
              className={`block border-l-2 py-[9px] pl-[14px] text-[14px] tracking-[-0.01em] hover:!no-underline max-pc:border-l-0 max-pc:border-b-2 max-pc:px-0 max-pc:py-[6px] ${
                active ? "border-ink !text-ink font-bold" : "border-transparent !text-muted hover:!text-ink"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
