"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PHONE_TEL } from "@/lib/site";

const ICON = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * 오른쪽 아래 스티키 버튼 2개 — 전화(흰 바탕 · 검정 아이콘) / 문의하기(검정 바탕 · 흰 아이콘)
 * - 두 버튼이 번갈아 흔들려 눈에 띈다 (같은 애니메이션, 두 번째는 반 주기 지연)
 * - 호버하면 알약 모양으로 왼쪽으로 펼쳐지며 "전화하기 / 문의하기" 라벨이 나온다
 * - 모바일: 스크롤이 멈추면 오른쪽으로 스르르 숨고, 다시 스크롤하면 나온다
 */
export default function FloatingButtons() {
  const [hidden, setHidden] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 919.98px)");
    const arm = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setHidden(true), 1600);
    };
    const onScroll = () => {
      if (!mq.matches) return;
      setHidden(false);
      arm();
    };
    const onMq = () => {
      setHidden(false);
      if (mq.matches) arm();
    };
    onMq();
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onMq);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-[28px] right-[28px] z-[900] flex flex-col items-end gap-[12px] transition-transform duration-500 ease-out max-pc:bottom-[20px] max-pc:right-[16px] ${
        hidden ? "max-pc:translate-x-[calc(100%+32px)]" : ""
      }`}
    >
      <a
        href={PHONE_TEL}
        aria-label="전화 걸기"
        className="float-wiggle group flex h-[64px] items-center rounded-full border border-line bg-white !text-ink shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)] hover:!no-underline"
      >
        {/* 호버 시 왼쪽으로 펼쳐지는 라벨 (max-width 0 → 펼침) */}
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-semibold transition-all duration-300 group-hover:max-w-[120px] group-hover:pl-[22px]">전화하기</span>
        <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center">
          <svg {...ICON}>
            <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1.5 1.5 0 0 1-1.5 1.5C10.5 20.5 3.5 13.5 3.5 5.5A1.5 1.5 0 0 1 5 4Z" />
          </svg>
        </span>
      </a>
      <Link
        href="/contact"
        aria-label="문의하기"
        className="float-wiggle float-wiggle-2 group flex h-[64px] items-center rounded-full bg-ink !text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] hover:!bg-[#222] hover:!no-underline"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-semibold transition-all duration-300 group-hover:max-w-[120px] group-hover:pl-[22px]">문의하기</span>
        <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center">
          <svg {...ICON}>
            <path d="M4 5h16v11H9l-5 4z" />
            <path d="M8 9h8M8 12h5" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
