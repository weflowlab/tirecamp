/**
 * 서비스 가격 안내 (VAT 포함)
 * - 표 대신 "라벨 + 큰 숫자" 타일로, 한눈에 읽히게
 * ※ 금액은 레퍼런스 사이트 기준 임시값 — 타이어캠프 실제 공임으로 확인 후 교체 필요
 */
const NUM = { fontFamily: "var(--font-num)" } as const;

const PASSENGER: [string, string][] = [
  ["16인치 이하", "12,000"],
  ["17인치", "14,000"],
  ["18인치", "16,000"],
  ["19인치", "17,000"],
  ["20인치", "18,000"],
  ["21인치 이상", "문의"],
];
const TRUCK: [string, string][] = [
  ["앞타이어", "10,000"],
  ["뒤타이어", "7,000"],
  ["뒤타이어 · 스페어 포함", "5,000"],
];
const ALIGN: [string, string, string][] = [
  ["소형", "", "25,000"],
  ["중형", "아반떼 · 소나타", "30,000"],
  ["대형", "그랜저", "35,000"],
  ["화물 · RV", "", "30,000"],
  ["수입차", "차종별 상이", "40,000~"],
];
const OTHERS: { group: string; items: [string, string][] }[] = [
  {
    group: "위치 교환 · 앞뒤",
    items: [
      ["19인치 이하", "15,000원"],
      ["20인치 이상", "20,000원"],
    ],
  },
  {
    group: "밸런스 · 밸브",
    items: [
      ["휠 밸런스", "교체 시 무료 · 짝당 5,000원"],
      ["에어밸브 교체", "교체 시 포함 · 개당 5,000원"],
      ["TPMS 밸브 교체", "10,000원 · 쌍용 15,000원"],
    ],
  },
  {
    group: "추가 공임",
    items: [
      ["런플랫 타이어", "+4,000원"],
      ["20인치 이상 · 40시리즈 이하", "+5,000원"],
      ["차량 간 TPMS 이식", "5,000원"],
      ["사제 휠", "문의"],
    ],
  },
];

export default function PriceTable() {
  return (
    <section className="w-full font-sans">
      <SectionHead eyebrow="Service Price" title="서비스 가격 안내" note="VAT 포함 · 현금 · 카드 동일 금액" />

      {/* 1. 타이어 교체 공임 — 인치별 타일 */}
      <Block title="타이어 교체 공임" sub="개당 · TPMS · 밸런스 · 에어밸브 무료 포함">
        <p className="eyebrow mb-[8px]">승용 · SUV</p>
        <ul className="grid grid-cols-6 gap-[6px] max-pc:grid-cols-3">
          {PASSENGER.map(([label, price]) => (
            <Tile key={label} label={label} price={price} />
          ))}
        </ul>
        <p className="eyebrow mb-[8px] mt-[18px]">1톤 이하 · 포터 · 봉고</p>
        <ul className="grid grid-cols-6 gap-[6px] max-pc:grid-cols-3">
          {TRUCK.map(([label, price]) => (
            <Tile key={label} label={label} price={price} />
          ))}
        </ul>
        <p className="mt-[8px] text-[11px] text-faint">스페어 포함 뒤타이어는 TPMS · 밸런스 · 에어밸브 서비스가 제외됩니다.</p>
      </Block>

      {/* 2. 얼라인먼트 */}
      <Block title="얼라인먼트" sub="전기차는 하부 커버 탈거 공임 +10,000원">
        <ul className="grid grid-cols-5 gap-[6px] max-pc:grid-cols-3">
          {ALIGN.map(([label, ex, price]) => (
            <Tile key={label} label={label} sub={ex} price={price} />
          ))}
        </ul>
      </Block>

      {/* 3. 기타 서비스 — 3열 짧은 목록 */}
      <Block title="기타 서비스" sub="위치 교환 · 밸런스 · 밸브 · 추가 공임">
        <div className="grid grid-cols-3 gap-x-[32px] gap-y-[20px] max-pc:grid-cols-1">
          {OTHERS.map((g) => (
            <div key={g.group}>
              <p className="eyebrow mb-[6px]">{g.group}</p>
              <ul>
                {g.items.map(([label, value]) => (
                  <li key={label} className="flex items-baseline justify-between gap-[12px] border-b border-line py-[10px] text-[13px] last:border-b-0">
                    <span className="text-graphite">{label}</span>
                    <span className="shrink-0 text-right font-semibold text-ink" style={NUM}>
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Block>

      <p className="mt-[10px] text-center text-[12px] text-muted">
        온라인 금액 그대로 판매합니다. 현금 · 카드 동일 금액, 모든 금액은 VAT 포함입니다.
      </p>
    </section>
  );
}

/* ---------- 공용 조각 ---------- */

export function SectionHead({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div className="mb-[16px] flex items-end justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-[4px] text-[20px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
      </div>
      {note && <p className="text-[12px] text-muted max-pc:hidden">{note}</p>}
    </div>
  );
}

/* 항목 블록: 제목 줄 + 내용 */
function Block({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="mt-[10px] border border-line bg-white p-[22px] first-of-type:mt-0 max-pc:p-[14px]">
      <div className="mb-[16px] flex items-baseline justify-between gap-[10px] max-pc:flex-col max-pc:gap-[2px]">
        <h3 className="text-[16px] font-bold tracking-[-0.01em] text-ink">{title}</h3>
        {sub && <span className="text-[12px] text-muted">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

/* 라벨 + 큰 가격 타일 */
function Tile({ label, sub, price }: { label: string; sub?: string; price: string }) {
  const isNum = /^\d/.test(price);
  return (
    <li className="bg-surface px-[12px] py-[14px]">
      <p className="text-[12px] text-graphite">{label}</p>
      {sub && <p className="text-[11px] text-faint">{sub}</p>}
      <p className={`mt-[6px] font-semibold leading-none text-ink ${isNum ? "text-[20px]" : "text-[15px]"}`} style={NUM}>
        {price}
        {isNum && <span className="ml-[1px] text-[12px] font-normal text-muted">원</span>}
      </p>
    </li>
  );
}
