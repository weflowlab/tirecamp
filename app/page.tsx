import Link from "next/link";
import FindTireBox from "@/components/tire/FindTireBox";
import OrderSteps from "@/components/tire/OrderSteps";
import { Purposes, Strengths } from "@/components/home/Features";
import InfoCards from "@/components/home/InfoCards";
import { getNews, newsViewHref } from "@/lib/news";
import { PHONE_TEL, SITE } from "@/lib/site";

/**
 * 메인 페이지 (/)
 * 차콜 히어로(절제된 타이포 + 매장 정보 한 줄 요약) → 검색 카드 → … → 최근 공지
 * (고객 요청 "잡다한 이미지 지양" 에 따라 배너 이미지는 두지 않는다)
 */
/* 공지는 요청 시마다 data/news.json 을 읽는다 (관리자 수정 즉시 반영) */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recent = (await getNews()).slice(0, 3);

  return (
    <div className="w-full font-sans">
      {/* 히어로 — 실제 매장 진열대 사진(민트색 선반 + 타이어).
          사진 색을 최대한 살리되, 흰 글자가 읽힐 만큼만 왼쪽을 덮는다 (글자 그림자는 쓰지 않는다).
          첫 화면에 검색 카드와 이용 절차까지 보이도록 높이는 계속 절제 */}
      <section
        /* 테두리는 어두운 사진과 흰 바탕 사이에 놓여서 옅은 회색으로는 보이지 않는다 → 매장 선반과 같은 청록색 2px */
        className="relative w-full overflow-hidden rounded-[14px] border-2 border-[#2E7D90] bg-charcoal bg-cover bg-center px-[48px] py-[44px] text-white max-pc:rounded-[10px] max-pc:px-[24px] max-pc:py-[36px]"
        style={{ backgroundImage: "url(/images/hero-store.webp)" }}
      >
        {/* 글자가 읽힐 만큼만 덮는다 — 글자가 놓인 왼쪽만 눌러 주고 오른쪽 사진은 거의 원본색.
            더 밝게/어둡게는 아래 세 숫자(0.66 → 0.36 → 0.08)만 올리거나 내리면 된다 */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,26,44,0.66)_0%,rgba(6,26,44,0.36)_50%,rgba(6,26,44,0.08)_100%)]" />

        <div className="relative">
          <p className="eyebrow !text-white">{SITE.name} · 양주</p>
          <h1 className="mt-[12px] text-[30px] font-bold leading-[1.3] tracking-[-0.02em] text-white max-pc:text-[24px]">타이어 교체를 투명한 가격으로</h1>
          <div className="mt-[20px] flex items-center gap-[10px]">
            <Link href="/contact" className="btn-fill !bg-white !text-ink hover:!bg-[#E8E8E8] max-pc:flex-1 max-pc:!px-0">
              문의하기
            </Link>
            <Link href="/product/tire/searchbysize" className="btn-outline !text-white hover:bg-white hover:!text-ink hover:!no-underline max-pc:flex-1 max-pc:!px-0">
              타이어 검색
            </Link>
          </div>

          {/* 매장 정보 한 줄 요약 (영업시간 · 전화 문의 · 오시는 길)
              히어로 안쪽 맨 아래 — 흰 띠를 만들지 않아 아래 검색 카드의 겹침 연출을 유지한다.
              모바일은 한 줄에 다 안 들어가서 영업 시간 보조 문구를 접고 줄바꿈을 허용한다 (정렬은 PC·모바일 모두 왼쪽) */}
          <div className="mt-[24px] flex items-center gap-[10px] border-t border-white/15 pt-[14px] text-[13px] leading-[22px] text-white max-pc:mt-[18px] max-pc:flex-wrap max-pc:justify-start max-pc:gap-x-[8px] max-pc:gap-y-[6px] max-pc:pt-[12px] max-pc:text-[12px]">
            {/* 각 항목은 그룹 안에서 줄이 끊기지 않도록 whitespace-nowrap */}
            <span className="flex shrink-0 items-center gap-[8px] whitespace-nowrap">
              <b className="font-bold text-white">영업 시간</b>
              {/* 숫자 폰트는 같은 px 에서 한글보다 작아 보여 한 단계 크게 */}
              <span className={NUM} style={{ fontFamily: "var(--font-num)" }}>
                09:00 – 19:00
              </span>
              <span className="text-white max-pc:hidden">평일 · 토 09:00 – 18:00 · 일 휴무</span>
            </span>
            <Bar />
            <span className="flex shrink-0 items-center gap-[8px] whitespace-nowrap">
              <b className="font-bold text-white">전화 문의</b>
              <a href={PHONE_TEL} className={`${NUM} !text-white hover:!no-underline`} style={{ fontFamily: "var(--font-num)" }}>
                {SITE.phone}
              </a>
            </span>
            {/* 모바일에서는 오시는 길을 다음 줄 맨 왼쪽으로 내린다 (구분선 없이) */}
            <Bar className="max-pc:hidden" />
            <span className="flex min-w-0 items-center gap-[8px] whitespace-nowrap max-pc:basis-full">
              <b className="shrink-0 font-bold text-white">오시는 길</b>
              <span className="truncate">{SITE.address.replace(/^경기\s*/, "")}</span>
              {/* 회사소개 페이지 아래쪽 "오시는 길"(지도 + 길찾기) 섹션으로 이동 */}
              <Link
                href="/company#location"
                className="ml-[2px] inline-flex h-[20px] shrink-0 items-center rounded-full border border-white/50 px-[9px] text-[10.5px] !text-white hover:border-white hover:bg-white hover:!text-ink hover:!no-underline"
              >
                지도 보기
              </Link>
            </span>
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

      {/* 서비스 가격표 — 자체 제작 이미지 2장 (레퍼런스 이미지 교체 완료, 금액은 대표님 확인분)
          고칠 때는 이미지를 새로 그려서 같은 파일명으로 덮어쓴다 */}
      <section className="mt-[64px] max-pc:mt-[44px]">
        <div className="mb-[16px]">
          <h2 className="mt-[4px] text-[21px] font-bold tracking-[-0.02em] text-ink">서비스 가격 안내</h2>
        </div>
        <div className="flex flex-col gap-[10px]">
          {/* ?v= 는 캐시 깨기용 — 이미지를 고치면 숫자를 올린다 (파일명이 같으면 브라우저가 옛 그림을 계속 쓴다)
              2배(1800px)로 뽑은 이미지라 h-auto 필수 — globals.css 가 img{height:revert-layer} 로 되돌려 놔서
              h-auto 가 없으면 height 속성값(1096 등)이 그대로 세로 길이가 되어 이미지가 늘어난다 */}
          <img src="/images/home/price-tire.webp?v=2" alt="타이어 교체 서비스 가격표 (VAT 포함) — 승용 · SUV 17인치 이하 15,000원, 18~20인치 20,000원, 21인치 이상 25,000원" width={1800} height={1045} className="block h-auto w-full" />
          <img src="/images/home/price-align.webp?v=2" alt="얼라이먼트 · 위치 교환 · 휠 밸런스 (VAT 포함) — 얼라이먼트 경형 30,000원 · 중소형 40,000원 · 중대형 50,000원, 위치 교환 20,000원, 휠 밸런스 짝당 5,000원" width={1800} height={1486} className="block h-auto w-full" />
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

      {/* 최근 공지 */}
      <section className="mt-[56px] max-pc:mt-[40px]">
        <div className="flex items-end justify-between pb-[14px]">
          <div>
            <h2 className="mt-[4px] text-[21px] font-bold tracking-[-0.02em] text-ink">공지사항</h2>
          </div>
          <Link href="/cscenter/news" className="text-[13px] tracking-[0.04em] !text-muted hover:!text-ink hover:!no-underline">
            전체보기 →
          </Link>
        </div>
        <ul className="border-t border-line">
          {recent.length === 0 && <li className="py-[20px] text-[14px] text-muted">등록된 공지사항이 없습니다.</li>}
          {recent.map((n) => (
            <li key={n.seq} className="flex items-center justify-between gap-[16px] border-b border-line py-[16px]">
              <Link href={newsViewHref(n.seq)} className="flex min-w-0 items-center gap-[12px] text-[15px] !text-graphite hover:!text-ink hover:!no-underline">
                {n.notice && <span className="eyebrow shrink-0 !text-ink">공지</span>}
                <span className="truncate">{n.title}</span>
              </Link>
              <span className="shrink-0 text-[13px] text-faint" style={{ fontFamily: "var(--font-num)" }}>
                {n.date}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* 한 줄 요약의 숫자(영업시간 · 전화번호) — 숫자 폰트가 한글보다 작아 보여 1px 키운다 */
const NUM = "text-[14px] max-pc:text-[13px]";

/* 매장 정보 한 줄 요약의 항목 사이 세로 구분선 (히어로 위라 흰색 반투명) */
function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`mx-[6px] h-[12px] w-px shrink-0 bg-white/20 max-pc:mx-[2px] ${className}`} />;
}
