"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/lib/site";

/**
 * 관리자 셸 — 좌측 사이드바(PC) / 상단바 + 드로어(모바일)
 * 사이트와 같은 톤: 흰 사이드바 + 얇은 선, 현재 메뉴는 검정 채움, 본문은 오프화이트 바탕
 */
const MENUS = [
  { href: "/admin", label: "대시보드", exact: true },
  { href: "/admin/inquiries", label: "문의 관리" },
  { href: "/admin/tires", label: "타이어 관리" },
  { href: "/admin/cars", label: "차량 데이터 관리" },
  { href: "/admin/news", label: "공지사항 관리" },
  { href: "/admin/faq", label: "FAQ 관리" },
  { href: "/admin/popups", label: "팝업창 관리" },
  { href: "/admin/stats", label: "방문자 통계 · 유입" },
];

/* 하단 링크용 작은 선 아이콘 (16px) */
const ICON = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, className: "block shrink-0" };

function SiteIcon() {
  return (
    <svg {...ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg {...ICON}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function isActive(pathname: string, m: (typeof MENUS)[number]) {
  return m.exact ? pathname === m.href : pathname.startsWith(m.href);
}

function NavList({ pathname, onNavigate, onLogout }: { pathname: string; onNavigate?: () => void; onLogout: () => void }) {
  return (
    <nav className="flex h-full flex-col">
      <ul className="flex flex-col gap-[2px] px-[14px] py-[16px]">
        {MENUS.map((m) => {
          const active = isActive(pathname, m);
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                onClick={onNavigate}
                className={`block px-[14px] py-[11px] text-[14px] tracking-[-0.01em] transition-colors hover:!no-underline ${
                  active ? "bg-ink !text-white" : "!text-graphite hover:bg-surface hover:!text-ink"
                }`}
              >
                {m.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto flex flex-col gap-[2px] border-t border-line px-[14px] py-[14px] text-[13px]">
        <Link href="/" target="_blank" onClick={onNavigate} className="flex items-center gap-[10px] px-[14px] py-[9px] !text-muted hover:bg-surface hover:!text-ink hover:!no-underline">
          <SiteIcon />
          <span className="relative top-[1px] leading-none">사이트 보기</span>
        </Link>
        <button type="button" onClick={onLogout} className="flex items-center gap-[10px] px-[14px] py-[9px] text-left text-muted hover:bg-surface hover:text-ink">
          <LogoutIcon />
          <span className="relative top-[1px] leading-none">로그아웃</span>
        </button>
      </div>
    </nav>
  );
}

function Brand({ small }: { small?: boolean }) {
  return (
    <Link href="/admin" className="flex flex-col justify-center hover:!no-underline">
      <span className={`block font-bold leading-none tracking-[-0.04em] !text-ink ${small ? "text-[18px]" : "text-[22px]"}`}>{SITE.name}</span>
      <span className={`eyebrow block leading-none !text-faint ${small ? "mt-[4px]" : "mt-[5px]"}`}>Admin</span>
    </Link>
  );
}

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false); // 모바일 드로어 (메뉴 클릭 시 onNavigate 로 닫힘)

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full bg-surface font-sans text-graphite pc:h-screen">
      {/* PC 사이드바 */}
      <aside className="hidden w-[232px] shrink-0 flex-col overflow-y-auto border-r border-line bg-white pc:flex">
        <div className="border-b border-line px-[28px] py-[26px]">
          <Brand />
        </div>
        <NavList pathname={pathname} onLogout={onLogout} />
      </aside>

      {/* pc:min-h-0 이 없으면 main 이 부모를 넘겨 자라서 문서가 스크롤되고, main 안의 sticky 요소가 붙지 않는다 */}
      <div className="flex min-w-0 flex-1 flex-col pc:min-h-0">
        {/* 모바일 상단바 */}
        <header className="sticky top-0 z-40 flex h-[56px] items-center gap-[8px] border-b border-line bg-white px-[12px] pc:hidden">
          {/* 햄버거(왼쪽) → 로고. 로고 블록은 세로 가운데 */}
          <button type="button" aria-label="메뉴 열기" onClick={() => setOpen(true)} className="-ml-[4px] flex h-[40px] w-[40px] shrink-0 items-center justify-center text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Brand small />
        </header>

        {/* 모바일 드로어 */}
        {open && (
          <div className="fixed inset-0 z-[1500] pc:hidden">
            <button type="button" aria-label="메뉴 닫기" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-white shadow-[8px_0_30px_rgba(0,0,0,0.2)]">
              <div className="flex h-[56px] items-center justify-between border-b border-line px-[20px]">
                <Brand small />
                <button type="button" aria-label="메뉴 닫기" onClick={() => setOpen(false)} className="text-[18px] text-muted hover:text-ink">
                  ✕
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <NavList pathname={pathname} onNavigate={() => setOpen(false)} onLogout={onLogout} />
              </div>
            </div>
          </div>
        )}

        {/* 본문 — PC 는 이 영역만 스크롤 */}
        <main className="min-h-0 min-w-0 flex-1 px-[40px] py-[36px] pc:overflow-y-auto max-pc:px-[16px] max-pc:py-[24px]">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
