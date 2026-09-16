import { BRANDS } from "@/lib/tireSizeOptions";

/**
 * 안내 카드 3장 (차콜 배경) + 취급 브랜드 로고
 * - 사진은 원래 색 그대로 두고, 글자가 놓이는 아래쪽만 어둡게 덮는다 (출처: public/images/hero-tire.txt)
 */
export default function InfoCards() {
  return (
    <section className="w-full font-sans">
      <div className="grid grid-cols-3 gap-[10px] max-pc:grid-cols-1">
        <DarkCard eyebrow="재고" title="재고 대량 보유" desc="신품, 이월, 중고 타이어를 대량으로 보유하여 빠르게 교체, 출고할 수 있습니다." image="/images/home/stock.webp" />
        {/* 이 카드만 컬러 사진(하늘색) — 사진 오른쪽 하늘이 잘리지 않도록 가운데가 아닌 오른쪽 기준으로 맞춘다 */}
        <DarkCard eyebrow="서비스" title="전문 장착 & 휠 밸런스" desc="숙련된 전문가의 정확한 장착과 휠 밸런스 작업으로 안전한 드라이빙을 보장합니다." image="/images/home/wheel-sky.webp" position="bg-[position:65%_center]" />
        <SizeGuideCard />
      </div>

      {/* 취급 브랜드 — 로고가 천천히 흐르는 마퀴 (트랙 2벌, 마우스 올리면 멈춤) */}
      <div className="marquee mt-[28px] overflow-hidden border-y border-line py-[22px]">
        <ul className="marquee-track flex w-max items-center" style={{ ["--marquee-duration" as string]: "40s" }}>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <li key={`${b.code}-${i}`} className="shrink-0 px-[22px]" aria-hidden={i >= BRANDS.length}>
              <img src={`/images/companylogo/${b.code}.webp`} alt={i < BRANDS.length ? b.name : ""} className="img-fixed h-[22px] w-auto" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 사진 위 라벨 칩 — 흰 바탕 + 잉크색 글자, 한글이라 자간은 좁게 */
const SHADOW = "[text-shadow:0_1px_4px_rgba(0,0,0,0.6)]";

const CHIP = "relative inline-flex w-fit items-center rounded-[4px] bg-white px-[8px] py-[3px] text-[12px] font-bold tracking-[-0.02em] leading-[16px] text-ink";

/* 사진 위에 글자 — 덮개를 옅게 둔 만큼 글자 그림자로 가독성을 받친다 */
function DarkCard({ eyebrow, title, desc, image, position = "bg-center" }: { eyebrow: string; title: string; desc: string; image: string; position?: string }) {
  return (
    <div className={`relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-charcoal bg-cover ${position} p-[24px] text-white`} style={{ backgroundImage: `url(${image})` }}>
      {/* 사진 색을 살린다 — 위쪽은 덮지 않고, 글자가 놓이는 아래쪽만 어둡게 */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,14,0)_0%,rgba(14,14,14,0.05)_45%,rgba(14,14,14,0.82)_100%)]" />
      {/* 사진 위라 라벨이 묻혀서 흰 박스로 감싼다. .eyebrow 는 자간 0.22em 짜리 영문용이라 한글에는 쓰지 않는다 */}
      <span className={CHIP}>{eyebrow}</span>
      <p className={`relative mt-[8px] text-[20px] font-bold tracking-[-0.02em] text-white ${SHADOW}`}>{title}</p>
      <p className={`relative mt-[8px] text-[12.5px] leading-[18px] tracking-[-0.02em] text-[#D5D5D5] ${SHADOW}`}>{desc}</p>
    </div>
  );
}

/* 타이어 사이즈 보는 방법: 225 / 45 R 18 91W 표기 설명 */
export function SizeGuideCard({ className = "" }: { className?: string }) {
  const parts: [string, string][] = [
    ["225", "폭 (mm)"],
    ["45", "편평비 (%)"],
    ["R", "구조"],
    ["18", "인치"],
    ["91W", "하중 · 속도"],
  ];
  return (
    <div
      id="size-guide"
      className={`relative flex min-h-[260px] scroll-mt-[24px] flex-col justify-between overflow-hidden bg-charcoal bg-cover bg-[position:70%_center] p-[24px] text-white ${className}`}
      style={{ backgroundImage: "url(/images/hero-tire.webp)" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,14,0.52)_0%,rgba(14,14,14,0.10)_50%,rgba(14,14,14,0.84)_100%)]" />
      <div className={`relative flex items-start justify-between gap-[4px] border-b border-white/30 pb-[14px] ${SHADOW}`}>
        {parts.map(([v, l]) => (
          <div key={v} className="text-center">
            <p className="text-[22px] font-semibold leading-none text-white max-pc:text-[21px]" style={{ fontFamily: "var(--font-num)" }}>
              {v}
            </p>
            <p className="mt-[8px] text-[11px] text-[#CFCFCF]">{l}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <span className={CHIP}>사이즈 가이드</span>
        <p className={`mt-[6px] text-[20px] font-bold tracking-[-0.02em] text-white ${SHADOW}`}>타이어 사이즈 보는 방법</p>
        <p className={`mt-[8px] text-[13px] leading-[19px] text-[#D5D5D5] ${SHADOW}`}>타이어 옆면의 숫자와 문자로 사이즈 정보를 쉽게 확인하세요.</p>
      </div>
    </div>
  );
}
