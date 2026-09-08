import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import PhotoSlider from "@/components/company/PhotoSlider";
import { MAP_LINKS, PHONE_TEL, SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("회사소개"),
};

/**
 * 회사소개 (/company)
 * 소개 문구(기존 사이트 이전) → 매장 사진 슬라이드 → 매장 정보 → 오시는 길(지도 + 길찾기)
 */
export default function CompanyPage() {
  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="About Us" title="회사소개" sub={`${SITE.slogan}. 소형 타이어와 중고 타이어를 전문으로 하는 양주의 타이어 매장입니다.`} />

      {/* 소개 — 좌: 큰 문장(가늘게/굵게) + 짧은 세로선 / 우: 본문 (첫 문장 강조, 줄바꿈 고정) */}
      <section className="grid grid-cols-[300px_1fr] gap-[48px] max-pc:grid-cols-1 max-pc:gap-[20px]">
        <div>
          <p className="eyebrow">Our Promise</p>
          <h2 className="mt-[10px] text-[28px] font-light leading-[1.35] tracking-[-0.03em] text-ink max-pc:text-[22px]">
            타이어의 모든 것을
            <br />
            <span className="font-bold">한 곳에서 경험하세요.</span>
          </h2>
          <p className="mt-[10px] text-[12px] tracking-[0.04em] text-muted">{SITE.name}</p>
        </div>
        {/* 첫 문장의 베이스라인(글자 밑선)이 왼쪽 제목 첫 줄 베이스라인과 같은 높이가 되도록 보정 */}
        <div className="pt-[23px] text-[14px] leading-[26px] text-graphite max-pc:pt-0 max-pc:[&_br]:hidden">
          <p className="text-[16px] font-semibold leading-[38px] text-ink max-pc:leading-[28px]">
            {SITE.name}는 소형 타이어 전문 업체로, 고객님께 최상의 선택을 제안합니다.
          </p>
          <p className="mt-[6px]">
            국산·수입 전 브랜드 신품 타이어는 물론 다양한 중고 타이어를 보유하고 있어,
            <br />
            실용적이면서도 경제적인 선택을 찾는 분들에게 알맞습니다.
          </p>
          <p className="mt-[18px]">
            품질 높은 타이어를 합리적인 가격에 만나볼 수 있고,
            <br />
            상담을 통해 차량과 주행 환경에 맞는 맞춤형 추천도 해드립니다.
          </p>
          <p className="mt-[18px]">고객님의 안전과 만족을 최우선으로 생각하며, 함께 더 나은 드라이빙을 만들어 갑니다.</p>
        </div>
      </section>

      {/* 핵심 4가지 — 얇은 선으로만 나눈 스탯 스트립 */}
      <ul className="mt-[44px] grid grid-cols-4 border-y border-line max-pc:grid-cols-2">
        {[
          ["Brands", "전 브랜드", "국산 · 수입 신품 타이어"],
          ["Used", "중고 타이어", "상태 좋은 재고 다량 보유"],
          ["Fitting", "당일 장착", "예약 확인 후 방문 장착"],
          ["Price", "정직한 가격", "온라인 금액 그대로 판매"],
        ].map(([e, t, d], i) => (
          <li key={e} className={`px-[24px] py-[22px] max-pc:px-[12px] ${i < 3 ? "border-r border-line" : ""} max-pc:[&:nth-child(2)]:border-r-0 max-pc:[&:nth-child(-n+2)]:border-b max-pc:[&:nth-child(-n+2)]:border-line`}>
            <p className="eyebrow">{e}</p>
            <p className="mt-[6px] text-[18px] font-bold tracking-[-0.02em] text-ink max-pc:text-[16px]">{t}</p>
            <p className="mt-[2px] text-[12px] text-muted">{d}</p>
          </li>
        ))}
      </ul>

      {/* 매장 사진 슬라이드 (컬러) */}
      <section className="mt-[44px]">
        <PhotoSlider height={240} />
      </section>

      {/* 매장 정보 */}
      <section className="mt-[56px] grid grid-cols-[280px_1fr] gap-[40px] max-pc:grid-cols-1 max-pc:gap-[12px]">
        <div>
          <p className="eyebrow">Store</p>
          <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">매장 정보</h2>
        </div>
        <dl className="border-t border-line text-[14px]">
          <Row label="상호">{SITE.name}</Row>
          <Row label="주소">{SITE.address}</Row>
          <Row label="전화">
            <a href={PHONE_TEL} className="!text-ink" style={{ fontFamily: "var(--font-num)" }}>
              {SITE.phone}
            </a>
          </Row>
          <Row label="영업시간">
            {SITE.hours.map((h) => (
              <span key={h.label} className="block">
                {h.label} {h.value}
              </span>
            ))}
          </Row>
          <Row label="취급 품목">국산·수입 신품 타이어, 중고 타이어, 타이어 교체 · 펑크 수리 · 위치 교환</Row>
        </dl>
      </section>

      {/* 오시는 길 */}
      <section className="mt-[56px]">
        <div className="mb-[16px] flex items-end justify-between max-pc:flex-col max-pc:items-start max-pc:gap-[12px]">
          <div>
            <p className="eyebrow">Location</p>
            <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">오시는 길</h2>
          </div>
          <div className="flex gap-[8px]">
            <a href={MAP_LINKS.naver} target="_blank" rel="noreferrer" className="btn-outline !h-[38px] !px-[16px] !text-ink hover:bg-ink hover:!text-white hover:!no-underline">
              네이버지도
            </a>
            <a href={MAP_LINKS.kakao} target="_blank" rel="noreferrer" className="btn-outline !h-[38px] !px-[16px] !text-ink hover:bg-ink hover:!text-white hover:!no-underline">
              카카오맵
            </a>
          </div>
        </div>
        <div className="border border-line">
          <iframe
            title={`${SITE.name} 위치 지도`}
            src={MAP_LINKS.embed}
            className="block w-full h-[380px] max-pc:h-[280px]"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-[12px] flex items-center gap-[12px] text-[14px] text-ink">
          <span>{SITE.address}</span>
          <span className="text-[12px] leading-none text-muted">매장 앞 주차 가능</span>
        </p>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] border-b border-line py-[12px] max-pc:grid-cols-[100px_1fr]">
      <dt className="text-[12px] tracking-[0.02em] text-muted">{label}</dt>
      <dd className="text-[14px] leading-[22px] text-ink">{children}</dd>
    </div>
  );
}
