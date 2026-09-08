"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Popup } from "@/lib/popups";

/**
 * 레이어 팝업 — 관리자(팝업창 관리)가 등록한 노출 중인 팝업을 /api/popups 로 받아 띄운다
 * - 여러 개면 닫을 때마다 다음 팝업이 이어서 나온다
 * - "오늘 하루 열지 않기" 는 팝업별 쿠키(자정까지가 아닌 24시간)로 기억
 * - PC/모바일 이미지 분기 (모바일 이미지가 없으면 PC 이미지 사용), 딤 클릭·ESC 로 닫기
 */
type Item = Pick<Popup, "id" | "title" | "linkUrl" | "newWindow" | "hideToday" | "pcImage" | "mobImage" | "scope">;

const cookieKey = (id: number) => `tc_pop_${id}`;

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export default function LayerPopup() {
  const pathname = usePathname();
  const [queue, setQueue] = useState<Item[]>([]);
  const loadedFor = useRef("");

  useEffect(() => {
    // 홈 전용 팝업은 홈에서만. 경로가 바뀔 때마다 1회만 조회 (닫은 팝업은 sessionStorage 로 이번 접속 동안 제외)
    if (loadedFor.current === pathname) return;
    loadedFor.current = pathname;
    let active = true;
    fetch("/api/popups")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Item[]) => {
        if (!active) return;
        setQueue(list.filter((p) => (p.scope === "all" || pathname === "/") && getCookie(cookieKey(p.id)) !== "done" && sessionStorage.getItem(cookieKey(p.id)) !== "closed"));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  const popup = queue[0] ?? null;
  const open = popup !== null;

  const closeCurrent = () => {
    if (popup) sessionStorage.setItem(cookieKey(popup.id), "closed"); // 이번 접속 동안은 다시 안 띄움
    setQueue((q) => q.slice(1));
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCurrent();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!popup) return null;

  const hideToday = () => {
    setCookie(cookieKey(popup.id), "done", 1);
    closeCurrent();
  };

  const img = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={popup.pcImage} alt={popup.title} className={`block h-auto max-h-[78vh] w-auto max-w-full object-contain ${popup.mobImage ? "max-pc:hidden" : ""}`} />
      {popup.mobImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={popup.mobImage} alt={popup.title} className="hidden h-auto max-h-[78vh] w-auto max-w-full object-contain max-pc:block" />
      )}
    </>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={`${popup.title} 팝업`} className="fixed inset-0 z-[1900] flex items-center justify-center px-[16px] font-sans">
      <button type="button" aria-label="팝업 닫기" onClick={closeCurrent} className="absolute inset-0 bg-black/60" />
      <div className="relative w-fit max-w-[min(640px,92vw)] overflow-hidden rounded-[14px] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
        {popup.linkUrl ? (
          <a href={popup.linkUrl} target={popup.newWindow ? "_blank" : "_self"} rel={popup.newWindow ? "noreferrer noopener" : undefined} className="block hover:!no-underline">
            {img}
          </a>
        ) : (
          img
        )}
        <div className="flex h-[40px] items-center justify-between bg-ink px-[16px] text-[12px] text-white">
          {popup.hideToday ? (
            <button type="button" onClick={hideToday} className="tracking-[0.02em] text-[#C4C4C4] hover:text-white">
              오늘 하루 열지 않기
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={closeCurrent} className="font-semibold tracking-[0.04em] hover:underline">
            닫기 ✕
          </button>
        </div>
      </div>
    </div>
  );
}
