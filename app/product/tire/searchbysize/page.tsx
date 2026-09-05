import type { Metadata } from "next";
import FindTireBox from "@/components/tire/FindTireBox";

/* 원본 <title> 그대로 */
export const metadata: Metadata = {
  title: "타이어검색 | 타이어공장 - 전브랜드 인터넷가 판매",
};

/**
 * 타이어 탭 (/product/tire/searchbysize) — 원본 product/tire/searchbysize.aspx 본문
 * 상단 배너(900x80) → 검색 박스(차량/사이즈검색, 타이어탭 여백) → 하단 배너(900x300)
 * (본문 폭은 SiteChrome 의 <main> 이 잡아 주므로 w-full, 모바일에서는 이미지가 폭에 맞춰 축소)
 */
export default function SearchBySizePage() {
  return (
    <div className="w-full">
      {/* 상단 배너 (900x80) */}
      <div className="w-full">
        <img src="/jwtsm_comimg/tirekong2000/20260520093708609869.jpg" alt="" width={900} height={80} className="block" />
      </div>

      {/* 차량검색 + 사이즈검색 박스 (타이어탭은 orderproc 영역이 더 큼) */}
      <FindTireBox variant="tire" />

      {/* 하단 배너 (900x300) */}
      <div className="w-full">
        <img src="/jwtsm_comimg/tirekong2000/20260520094016208904.jpg" alt="" width={900} height={300} className="block" />
      </div>
    </div>
  );
}
