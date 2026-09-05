import CarFinder from "@/components/tire/CarFinder";
import SizeFinder from "@/components/tire/SizeFinder";

/**
 * 검은 테두리 900px 박스 (원본 <table width=900 style="border:1px solid #000000">)
 * 내용: 차량검색 → 점선 → 사이즈검색 → 점선 → 주문절차 이미지(orderproc3.gif)
 *
 * variant:
 *  - "home": 메인(/)  — orderproc3 영역 45px, 아래 여백 5px
 *  - "tire": 타이어탭 — orderproc3 영역 74px, 위 여백 9px, 아래 여백 16px
 *
 * 모바일: 박스가 화면 폭을 채우고(좌우 9px 안쪽 여백), 점선/이미지는 폭에 맞춤
 */
export default function FindTireBox({ variant = "home" }: { variant?: "home" | "tire" }) {
  const isTire = variant === "tire";

  return (
    <div className="w-full border border-black flex flex-col items-center max-pc:px-[9px]">
      {/* 차량검색 (frmsize) */}
      <CarFinder />

      {/* 점선 구분 (881px) + 5px 여백 */}
      <div className="w-[881px] dotline max-pc:w-full" />
      <div className="h-[5px]" />

      {/* 사이즈검색 (frmtsize) */}
      <SizeFinder />

      {/* 9px 여백 + 점선 + 여백(홈 5px / 타이어 9px) */}
      <div className="h-[9px]" />
      <div className="w-[881px] dotline max-pc:w-full" />
      <div className={isTire ? "h-[9px]" : "h-[5px]"} />

      {/* 주문절차 안내 이미지 (846x81) */}
      <div className={`w-[881px] flex items-center justify-center max-pc:w-full max-pc:h-auto max-pc:py-[6px] ${isTire ? "h-[74px]" : "h-[45px]"}`}>
        <img src="/images/orderproc3.gif" alt="주문절차" width={846} height={81} />
      </div>
      <div className={isTire ? "h-[16px]" : "h-[5px]"} />
    </div>
  );
}
