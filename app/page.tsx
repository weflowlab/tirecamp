import Link from "next/link";
import FindTireBox from "@/components/tire/FindTireBox";
import OrderSteps from "@/components/tire/OrderSteps";
import { Purposes, Strengths } from "@/components/home/Features";
import InfoCards from "@/components/home/InfoCards";
import { getNews, newsViewHref } from "@/lib/news";
import { MAP_LINKS, PHONE_TEL, SITE } from "@/lib/site";

/**
 * 메인 페이지 (/)
 * 차콜 히어로(절제된 타이포 + 얇은 링 모티프) → 검색 카드 → 매장 정보 3칸(얇은 선) → 최근 공지
 * (고객 요청 "잡다한 이미지 지양" 에 따라 배너 이미지는 두지 않는다)
 */
/* 공지는 요청 시마다 data/news.json 을 읽는다 (관리자 수정 즉시 반영) */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recent = (await getNews()).slice(0, 3);

  return (
    <div className="w-full font-sans">
      {/* 히어로 — 흑백 타이어 트레드 사진 위에 어두운 그라데이션, 첫 화면에 검색 카드와 이용 절차까지 보이도록 높이 절제 */}
      <section
        className="relative w-full overflow-hidden bg-charcoal bg-cover bg-[position:70%_center] px-[48px] py-[44px] text-white max-pc:px-[24px] max-pc:py-[36px]"
        style={{ backgroundImage: "url(/images/hero-tire.webp)" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(14,14,14,0.92)_0%,rgba(14,14,14,0.78)_45%,rgba(14,14,14,0.35)_100%)]" />

        <div className="relative">
          <p className="eyebrow !text-[#9A9A9A]">{SITE.nameEn} · Yangju</p>
          <h1 className="mt-[12px] text-[30px] font-light leading-[1.3] tracking-[-0.02em] text-white max-pc:text-[24px]">
            타이어의 모든 것을 <span className="font-bold">한 곳에서, 정직하게.</span>
          </h1>
          {/* PC: 2줄 */}
          <p className="mt-[12px] whitespace-nowrap text-[13px] leading-[22px] tracking-[-0.01em] text-[#C4C4C4] max-pc:hidden">
            국산·수입 전 브랜드 신품 타이어와 중고 타이어를 합리적인 가격에 제안합니다.
            <br />
            차종과 사이즈로 검색하고, 상담이 필요하면 언제든 연락 주세요.
          </p>
          {/* 모바일: 4줄 (줄바꿈 고정) */}
          <p className="mt-[12px] hidden whitespace-nowrap text-[13px] leading-[22px] tracking-[-0.02em] text-[#C4C4C4] max-pc:block">
            국산·수입 전 브랜드 신품 타이어와 중고 타이어를
            <br />
            합리적인 가격에 제안합니다.
            <br />
            차종과 사이즈로 검색하고,
            <br />
            상담이 필요하면 언제든 연락 주세요.
          </p>
          <div className="mt-[20px] flex items-center gap-[10px] max-pc:justify-center">
            <Link href="/contact" className="btn-fill !bg-white !text-ink hover:!bg-[#E8E8E8] max-pc:flex-1 max-pc:!px-0">
              문의하기
            </Link>
            <Link href="/product/tire/searchbysize" className="btn-outline !text-white hover:bg-white hover:!text-ink hover:!no-underline max-pc:flex-1 max-pc:!px-0">
              타이어 검색
            </Link>
            <a
              href={PHONE_TEL}
              className="ml-[6px] text-[15px] tracking-[0.02em] !text-[#C4C4C4] hover:!text-white hover:!no-underline max-pc:hidden"
              style={{ fontFamily: "var(--font-num)" }}
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* 차량검색 + 사이즈검색 (히어로 아래 살짝 겹쳐 올라오는 흰 카드) */}
      <div className="relative -mt-[14px] px-[24px] max-pc:mt-[16px] max-pc:px-0">
        <FindTireBox variant="home" />
      </div>

      {/* 이용 절차 */}
      <div className="mt-[40px] max-pc:mt-[32px]">
        <OrderSteps />
      </div>

      {/* 서비스 가격표 — 임시로 레퍼런스 이미지 2장 (텍스트 버전은 components/home/PriceTable.tsx) */}
      <section className="mt-[64px] max-pc:mt-[44px]">
        <div className="mb-[16px]">
          <p className="eyebrow">Service Price</p>
          <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">서비스 가격 안내</h2>
        </div>
        <div className="flex flex-col gap-[10px]">
          <img src="/jwtsm_comimg/tirekong2000/20260814063506387656.jpg" alt="타이어 교체 서비스 가격표 (VAT 포함)" width={900} height={548} className="block w-full" />
          <img src="/jwtsm_comimg/tirekong2000/20260814063556230122.jpg" alt="얼라인먼트 · 위치 교환 · 휠 밸런스 공임" width={900} height={650} className="block w-full" />
        </div>
      </section>

      {/* 장점 / 용도별 찾기 */}
      <div className="mt-[64px] max-pc:mt-[44px]">
        <Strengths />
      </div>
      <div className="mt-[64px] max-pc:mt-[44px]">
        <Purposes />
      </div>

      {/* 안내 카드 + 브랜드 로고 */}
      <div className="mt-[64px] max-pc:mt-[44px]">
        <InfoCards />
      </div>

      {/* 매장 정보 3칸 — 위아래 얇은 선, 칸 사이 얇은 세로선 */}
      <section className="mt-[56px] grid grid-cols-3 border-y border-line max-pc:mt-[40px] max-pc:grid-cols-1">
        {/* 세 칸 모두 [eyebrow / 제목 / 20px 메인 줄 / 13px 보조 줄] 같은 구조 */}
        <InfoCell eyebrow="Hours" title="영업시간">
          <span className={MAIN}>09:00 – 19:00</span>
          <span className={SUB}>평일 · 토 09:00 – 18:00 · 일 휴무</span>
        </InfoCell>
        <InfoCell eyebrow="Contact" title="전화 문의" className="border-x border-line max-pc:border-x-0 max-pc:border-y">
          <a href={PHONE_TEL} className={`${MAIN} !text-ink hover:!no-underline`}>
            {SITE.phone}
          </a>
          <span className={SUB}>견적 · 예약 · 중고 타이어 문의</span>
        </InfoCell>
        <InfoCell eyebrow="Location" title="오시는 길">
          {/* 한글은 같은 px 에서 숫자보다 커 보여 한 단계 작게 */}
          <span className={`${MAIN} !text-[15.5px]`}>{SITE.address.replace(/^경기\s*/, "")}</span>
          <span className={SUB}>
            <a href={MAP_LINKS.naver} target="_blank" rel="noreferrer" className="mr-[14px] !text-muted underline underline-offset-4 hover:!text-ink">
              네이버지도
            </a>
            <a href={MAP_LINKS.kakao} target="_blank" rel="noreferrer" className="!text-muted underline underline-offset-4 hover:!text-ink">
              카카오맵
            </a>
          </span>
        </InfoCell>
      </section>

      {/* 최근 공지 */}
      <section className="mt-[56px] max-pc:mt-[40px]">
        <div className="flex items-end justify-between pb-[14px]">
          <div>
            <p className="eyebrow">Notice</p>
            <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">공지사항</h2>
          </div>
          <Link href="/cscenter/news" className="text-[12px] tracking-[0.04em] !text-muted hover:!text-ink hover:!no-underline">
            전체보기 →
          </Link>
        </div>
        <ul className="border-t border-line">
          {recent.length === 0 && <li className="py-[20px] text-[13px] text-muted">등록된 공지사항이 없습니다.</li>}
          {recent.map((n) => (
            <li key={n.seq} className="flex items-center justify-between gap-[16px] border-b border-line py-[16px]">
              <Link href={newsViewHref(n.seq)} className="flex min-w-0 items-center gap-[12px] text-[14px] !text-graphite hover:!text-ink hover:!no-underline">
                {n.notice && <span className="eyebrow shrink-0 !text-ink">Notice</span>}
                <span className="truncate">{n.title}</span>
              </Link>
              <span className="shrink-0 text-[12px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
                {n.date}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* 매장 정보 3칸 공통: 메인 줄 / 보조 줄 */
const MAIN = "block whitespace-nowrap text-[17px] font-semibold leading-[24px] tracking-[-0.01em] text-ink max-pc:text-[15px] max-pc:leading-[22px]";
const SUB = "mt-[4px] block whitespace-nowrap text-[12px] leading-[18px] text-muted";

function InfoCell({ eyebrow, title, className = "", children }: { eyebrow: string; title: string; className?: string; children: React.ReactNode }) {
  return (
    /* 모바일: 영문 라벨 숨기고 [제목 | 내용] 가로 2단, 위아래 여백 축소 */
    <div className={`px-[28px] py-[26px] text-[13px] leading-[22px] text-graphite max-pc:grid max-pc:grid-cols-[80px_1fr] max-pc:items-center max-pc:gap-[12px] max-pc:px-[4px] max-pc:py-[14px] ${className}`}>
      <p className="eyebrow max-pc:hidden">{eyebrow}</p>
      <h3 className="mb-[4px] mt-[2px] text-[15px] font-bold leading-[22px] tracking-[-0.01em] text-ink max-pc:m-0 max-pc:text-[14px]">{title}</h3>
      <div className="max-pc:min-w-0">{children}</div>
    </div>
  );
}
