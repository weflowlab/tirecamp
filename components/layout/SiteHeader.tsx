import Link from "next/link";
import QuickSizeSearch from "./QuickSizeSearch";
import SiteNav from "./SiteNav";

/**
 * 공통 헤더 (원본 모든 페이지 상단 900px 테이블 영역)
 * - 1행: home / 예약확인 / 고객센터 작은 링크 (우측 정렬)
 * - 2행: 로고(330x90) | 사이즈 빠른검색 | 전화번호 이미지
 * - 3행: 갈색 배경 메뉴바 (SiteNav)
 *
 * 모바일(<920px): 1행 유지 → [로고 | 전화 이미지] 한 줄 → 사이즈검색 한 줄 → 메뉴(3열 2행)
 */
export default function SiteHeader() {
  return (
    <header className="w-full">
      {/* 원본 table height=109 이지만 실제 행 높이 합(30+100)=130px 로 렌더링됨 */}
      <div className="mx-auto w-[900px] h-[130px] max-pc:w-full max-pc:h-auto max-pc:px-[10px]">
        {/* 상단 작은 유틸 링크 */}
        <div className="h-[30px] flex justify-end items-center">
          <ul className="flex w-[284px] text-[12px]">
            {[
              { href: "/", label: "home" },
              { href: "/cscenter/tirebooking/custchk", label: "예약확인" },
              { href: "/cscenter/news", label: "고객센터" },
            ].map((l) => (
              <li key={l.href} className="w-[95px] text-center h-[23px] leading-[23px]">
                <Link href={l.href} className="!text-[#8F8F8F] font-[돋움,'Nanum_Gothic',sans-serif]">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 로고 / 사이즈검색 / 전화 이미지 */}
        {/* 원본 td valign=top 이므로 items-start (flex stretch 로 이미지가 늘어나지 않게) */}
        {/* 모바일: flex-wrap + order 로 [로고, 전화] → [검색] 순서로 재배치 */}
        <div className="flex h-[100px] items-start max-pc:h-auto max-pc:flex-wrap max-pc:items-center max-pc:justify-between max-pc:pb-[10px]">
          <div className="w-[340px] max-pc:w-[56%] max-pc:order-1">
            <Link href="/">
              <img
                src="/jwtsm_comimg/tirekong2000/20260520035452856411.png"
                width={330}
                height={90}
                alt="타이어공장"
              />
            </Link>
          </div>
          <div className="w-[325px] flex justify-center max-pc:w-full max-pc:order-3 max-pc:pt-[6px]">
            <QuickSizeSearch />
          </div>
          <div className="w-[235px] flex justify-center max-pc:w-[40%] max-pc:order-2 max-pc:justify-end">
            <img
              src="/jwtsm_comimg/tirekong2000/20260814060010935578.png"
              width={220}
              height={80}
              alt="문의전화 031-863-0909"
            />
          </div>
        </div>
      </div>

      <SiteNav />
    </header>
  );
}
