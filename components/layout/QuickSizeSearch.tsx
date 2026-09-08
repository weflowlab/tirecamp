"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

/**
 * 헤더 사이즈 빠른검색
 * - 빈 값이면 alert 후 중단
 * - 입력 예: 2254518 또는 225/45R18 → /product/tire/sizelist?find_ftsize=... 로 이동
 * - 모바일: 폼이 화면 폭을 꽉 채움
 */
export default function QuickSizeSearch() {
  const router = useRouter();
  const [size, setSize] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (size.trim() === "") {
      alert("검색사이즈를 입력하세요");
      return;
    }
    router.push(`/product/tire/sizelist?find_ftsize=${encodeURIComponent(size.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-[360px] font-sans max-pc:w-full">
      <div className="flex h-[40px] border border-line focus-within:border-ink">
        <input
          type="text"
          name="find_ftsize"
          value={size}
          placeholder="사이즈 검색  예) 225/45R18"
          onChange={(e) => setSize(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-[12px] text-[14px] text-ink outline-none placeholder:text-faint"
          style={{ fontFamily: "var(--font-num)" }}
        />
        <button type="submit" className="w-[52px] shrink-0 bg-ink text-[12px] font-medium text-white hover:bg-[#333]">
          검색
        </button>
      </div>
    </form>
  );
}
