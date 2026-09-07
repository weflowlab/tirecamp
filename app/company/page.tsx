import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import { MAP_LINKS, PHONE_TEL, SITE, pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("회사소개"),
};

/* 매장 사진 (기존 ok114 페이지에서 이전, 1400px 리사이즈 + EXIF 제거). 흑백 처리로 톤을 맞춤 */
const PHOTOS = ["/images/company/store1.jpg", "/images/company/store2.jpg", "/images/company/store3.jpg"];

/**
 * 회사소개 (/company)
 * 소개 문구(기존 사이트 이전) → 매장 사진(흑백) → 매장 정보 → 오시는 길(지도 + 길찾기)
 */
export default function CompanyPage() {
  return (
    <div className="w-full font-sans">
      <PageTitle eyebrow="About Us" title="회사소개" sub={`${SITE.slogan}. 소형 타이어와 중고 타이어를 전문으로 하는 양주의 타이어 매장입니다.`} />

      {/* 소개 문구 — 좌 제목 / 우 본문 2단 */}
      <section className="grid grid-cols-[280px_1fr] gap-[40px] max-pc:grid-cols-1 max-pc:gap-[16px]">
        <h2 className="text-[24px] font-bold leading-[1.4] tracking-[-0.03em] text-ink max-pc:text-[20px]">
          타이어의 모든 것을
          <br />한 곳에서 경험하세요.
        </h2>
        <div className="text-[14px] leading-[26px] text-graphite">
          <p>
            {SITE.name}는 소형 타이어 전문 업체로, 고객님께 최상의 선택을 제안합니다. 국산·수입 전 브랜드 신품 타이어는 물론{" "}
            <b className="font-semibold text-ink">다양한 중고 타이어를 보유</b>하고 있어, 실용적이면서도 경제적인 선택을 찾는 분들에게
            알맞습니다.
          </p>
          <p className="mt-[14px]">
            <b className="font-semibold text-ink">품질 높은 타이어를 합리적인 가격</b>에 만나볼 수 있고, 상담을 통해 차량과 주행 환경에 맞는
            맞춤형 추천도 해드립니다.
          </p>
          <p className="mt-[14px]">고객님의 안전과 만족을 최우선으로 생각하며, 함께 더 나은 드라이빙을 만들어 갑니다.</p>
        </div>
      </section>

      {/* 매장 사진 — 흑백, 마우스 올리면 컬러 */}
      <section className="mt-[48px] grid grid-cols-3 gap-[6px] max-pc:grid-cols-1">
        {PHOTOS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${SITE.name} 매장 사진 ${i + 1}`}
            className="block w-full aspect-[4/3] object-cover grayscale transition duration-500 hover:grayscale-0"
            loading="lazy"
          />
        ))}
      </section>

      {/* 매장 정보 */}
      <section className="mt-[56px] grid grid-cols-[280px_1fr] gap-[40px] max-pc:grid-cols-1 max-pc:gap-[12px]">
        <div>
          <p className="eyebrow">Store</p>
          <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">매장 정보</h2>
        </div>
        <dl className="border-t border-line text-[14px]">
          <Row label="상호">{SITE.name}</Row>
          <Row label="대표">{SITE.ceo}</Row>
          <Row label="사업자등록번호">{SITE.bizNo}</Row>
          <Row label="주소">{SITE.address}</Row>
          <Row label="전화">
            <a href={PHONE_TEL} className="!text-ink" style={{ fontFamily: "var(--font-num)" }}>
              {SITE.phone}
            </a>
          </Row>
          <Row label="이메일">{SITE.email}</Row>
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
            style={{ border: 0, filter: "grayscale(1) contrast(0.95)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-[12px] text-[14px] text-ink">
          {SITE.address}
          <span className="ml-[12px] text-[12px] text-muted">매장 앞 주차 가능</span>
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
