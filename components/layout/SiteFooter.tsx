import Link from "next/link";

/**
 * 공통 푸터 (원본 하단 900px 테이블)
 * - 좌: 푸터 로고 이미지 / 우: 사업자 정보, 주소, 저작권
 */
export default function SiteFooter() {
  return (
    <footer className="w-[900px] mt-[20px] mb-[20px]">
      <div className="flex items-center h-[131px]">
        <div className="w-[262px]">
          <img src="/jwtsm_comimg/tirekong2000/20260520041216143759.png" alt="타이어공장" />
        </div>
        <div className="w-[638px] flex justify-end">
          <div className="w-[611px] text-[8pt] text-[#A7A7A7]" style={{ fontFamily: "돋움, 'Nanum Gothic', sans-serif" }}>
            <p className="h-[22px] leading-[22px] text-[8pt] text-[#A7A7A7]">
              타이어공장 &nbsp;대표: 유동균외 사업등록번호: 672-50-01100&nbsp; 문의전화:{" "}
              <b className="text-[9pt] text-[#FF9900]" style={{ fontFamily: "Tahoma, sans-serif" }}>
                031-863-0909
              </b>
              &nbsp;&nbsp;
              <Link href="/cscenter/personal_info" className="!text-[#ADADAD] font-bold tracking-[-1pt]">
                개인정보취급방침
              </Link>
            </p>
            <p className="h-[22px] leading-[22px] text-[8pt] text-[#A7A7A7]">
              경기도 양주시 봉양동 632-1&nbsp; 개인정보관리자: 유동균 (dstire119@naver.com)
            </p>
            <p className="h-[25px] leading-[25px] text-[8pt] text-[#A7A7A7]" style={{ fontFamily: "Tahoma, sans-serif" }}>
              COPYRIGHT &copy; <b>타이어공장</b> CORP. All Right Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
