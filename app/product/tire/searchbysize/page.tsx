import type { Metadata } from "next";
import FindTireBox from "@/components/tire/FindTireBox";
import OrderSteps from "@/components/tire/OrderSteps";
import PageTitle from "@/components/layout/PageTitle";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("타이어검색"),
};

/**
 * 타이어검색 탭 (/product/tire/searchbysize)
 * 타이틀 → 검색 카드(차량/사이즈검색) → 이용 안내
 */
export default function SearchBySizePage() {
  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="Tire Search" title="타이어검색" sub="차종을 선택하거나 타이어 옆면의 사이즈(예: 205/55R16)를 입력해 가격을 확인하세요." />

      <FindTireBox variant="tire" />

      <div className="mt-[48px] max-pc:mt-[36px]">
        <OrderSteps />
      </div>
    </div>
  );
}
