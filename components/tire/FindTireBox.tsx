import CarFinder from "@/components/tire/CarFinder";
import SizeFinder from "@/components/tire/SizeFinder";

/**
 * 타이어 검색 카드 (차종으로 타이어 검색 → 타이어사이즈로 검색)
 * - 흰 카드, 얇은 선 테두리 + 은은한 그림자. 구간 사이는 얇은 선
 * - 이용 절차는 별도 섹션(OrderSteps)
 *
 * variant: "home"(메인) / "tire"(타이어검색 탭) — 여백만 조금 다름
 */
/** tinfo: 타이어소개에서 넘어온 선택 타이어 seq — 검색 결과 URL 에 실어 보낸다 */
export default function FindTireBox({ variant = "home", tinfo }: { variant?: "home" | "tire"; tinfo?: string }) {
  const pad = variant === "tire" ? "px-[28px] max-pc:px-[14px]" : "px-[24px] max-pc:px-[14px]";

  return (
    <div className={`w-full border border-line bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] ${pad}`}>
      <div className="py-[16px]">
        <CarFinder tinfo={tinfo} />
      </div>
      <div className="border-t border-line py-[16px]">
        <SizeFinder tinfo={tinfo} />
      </div>
    </div>
  );
}
