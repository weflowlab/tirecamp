"use client";

import { useEffect, useRef } from "react";

/** 가로 스크롤 상자 — 처음 열릴 때 오른쪽 끝(가장 최근)이 보이도록 스크롤해 둔다 */
export default function ScrollToEnd({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);
  return (
    <div ref={ref} className={`overflow-x-auto overflow-y-hidden ${className}`}>
      {children}
    </div>
  );
}
