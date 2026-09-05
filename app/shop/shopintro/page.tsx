import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "매장소개 | 타이어공장 - 전브랜드 인터넷가 판매",
};

/**
 * 매장소개 (원본 /shop/shopintro.aspx)
 * - 본문은 900x500, 900x300 이미지 두 장이 세로로 이어짐 (모바일에서는 폭에 맞춰 축소)
 */
export default function ShopIntroPage() {
  return (
    <div className="w-full">
      <img src="/jwtsm_comimg/tirekong2000/20260520092500283230.jpg" width={900} height={500} alt="매장소개" />
      <img src="/jwtsm_comimg/tirekong2000/20260520085410349645.jpg" width={900} height={300} alt="" />
    </div>
  );
}
