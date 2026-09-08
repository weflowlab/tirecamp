import { BRANDS } from "@/lib/tireSizeOptions";

/**
 * 안내 카드 3장 (차콜 배경) + 취급 브랜드 로고
 * - 사진 자리는 비워 두고 텍스트로 구성. 고객 매장 사진을 받으면 카드 배경으로 넣을 수 있음
 */
export default function InfoCards() {
  return (
    <section className="w-full font-sans">
      <div className="grid grid-cols-3 gap-[10px] max-pc:grid-cols-1">
        <DarkCard eyebrow="Stock" title="창고형 대량재고 보유" desc={"신품 · 이월 · 중고 타이어를 대량 보유하여\n빠른 출고와 장착을 한 번에 만나볼 수 있습니다."} />
        <DarkCard eyebrow="Service" title="전문 장착 & 휠 밸런스" desc={"숙련된 전문가의 정확한 장착과\n휠 밸런스 작업으로 안전한 드라이빙을 보장합니다."} />
        <SizeGuideCard />
      </div>

      {/* 취급 브랜드 — 로고가 천천히 흐르는 마퀴 (트랙 2벌, 마우스 올리면 멈춤) */}
      <div className="marquee mt-[28px] overflow-hidden border-y border-line py-[22px]">
        <ul className="marquee-track flex w-max items-center" style={{ ["--marquee-duration" as string]: "40s" }}>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <li key={`${b.code}-${i}`} className="shrink-0 px-[22px]" aria-hidden={i >= BRANDS.length}>
              <img src={`/images/companylogo/${b.code}.gif`} alt={i < BRANDS.length ? b.name : ""} className="img-fixed h-[22px] w-auto" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DarkCard({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-charcoal p-[24px] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
      <p className="eyebrow relative !text-[#8C8C8C]">{eyebrow}</p>
      <p className="relative mt-[6px] text-[19px] font-bold tracking-[-0.02em] text-white">{title}</p>
      <p className="relative mt-[8px] whitespace-pre-line text-[11.5px] leading-[18px] tracking-[-0.02em] text-[#B8B8B8]">{desc}</p>
    </div>
  );
}

/* 타이어 사이즈 보는 방법: 225 / 45 R 18 91W 표기 설명 */
function SizeGuideCard() {
  const parts: [string, string][] = [
    ["225", "폭 (mm)"],
    ["45", "편평비 (%)"],
    ["R", "구조"],
    ["18", "인치"],
    ["91W", "하중 · 속도"],
  ];
  return (
    <div className="flex min-h-[260px] flex-col justify-between bg-charcoal p-[24px] text-white">
      <div className="flex items-start justify-between gap-[4px] border-b border-[#3A3A3A] pb-[14px]">
        {parts.map(([v, l]) => (
          <div key={v} className="text-center">
            <p className="text-[22px] font-semibold leading-none text-white max-pc:text-[20px]" style={{ fontFamily: "var(--font-num)" }}>
              {v}
            </p>
            <p className="mt-[8px] text-[10px] text-[#8C8C8C]">{l}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="eyebrow !text-[#8C8C8C]">Size Guide</p>
        <p className="mt-[6px] text-[19px] font-bold tracking-[-0.02em] text-white">타이어 사이즈 보는 방법</p>
        <p className="mt-[8px] text-[12px] leading-[19px] text-[#B8B8B8]">타이어 옆면의 숫자와 문자로 사이즈 정보를 쉽게 확인하세요.</p>
      </div>
    </div>
  );
}
