"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

/**
 * 헤더 사이즈 빠른검색 (원본 form name="commfindsize")
 * - 빈 값이면 alert("검색사이즈를 입력하세요") 후 중단 (원본 commfindtire())
 * - 입력 예: 2254518 또는 225/45R18 → /product/tire/sizelist?find_ftsize=... 로 이동
 * - 모바일: 폼이 화면 폭을 꽉 채우고 입력창이 남는 폭을 모두 차지
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
    <form onSubmit={onSubmit} className="w-[290px] pt-[10px] max-pc:w-full max-pc:pt-0">
      <div className="flex h-[35px] items-center max-pc:h-auto">
        <div className="w-[238px] px-[10px] max-pc:flex-1 max-pc:pl-0">
          <input
            type="text"
            name="find_ftsize"
            className="insbox1"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <div className="w-[52px] flex justify-center">
          {/* 원본 input type=image 검색 버튼 */}
          <input type="image" src="/images/button/findbut.gif" alt="검색" width={38} height={29} className="img-fixed" />
        </div>
      </div>
      <p className="h-[23px] text-[12px] text-[#8F8F8F] tracking-[-1px] leading-[23px] max-pc:h-auto max-pc:leading-[18px] max-pc:pt-[4px]">
        사이즈를 아시면 입력하세요 (예:2254518 or 225/45R18)
      </p>
    </form>
  );
}
