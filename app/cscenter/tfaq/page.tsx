import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자주 묻는 질문 | 타이어공장 - 전브랜드 인터넷가 판매",
};

/**
 * 자주 묻는 질문 (원본 /cscenter/tfaq/ 는 404, 서브메뉴에서도 주석 처리됨)
 * - 고객센터 공통 프레임 안에 "준비중입니다." 안내만 표시
 */
export default function FaqPage() {
  return (
    <div className="w-[672px] max-pc:w-full">
      {/* 타이틀 (개인정보취급방침 페이지의 텍스트 타이틀 스타일 준용) */}
      <div style={{ height: 62, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "돋움, 'Nanum Gothic', sans-serif", fontSize: "25pt", fontWeight: 700, letterSpacing: "-4px" }}>
          자주 묻는 질문
        </span>
      </div>
      <div style={{ height: 12 }} />
      <div className="w-[672px] h-[2px] bg-[#E4E4E4] max-pc:w-full" />
      <div className="w-[672px] h-[200px] flex items-center justify-center max-pc:w-full">준비중입니다.</div>
    </div>
  );
}
