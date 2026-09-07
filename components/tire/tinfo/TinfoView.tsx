import type { Tinfo } from "@/lib/tinfo";

const NUM = { fontFamily: "var(--font-num)" } as const;

/**
 * 타이어 상세 팝업 본문 (766px 폭, 헤더/푸터 없음)
 *
 * 상단(우리 스타일): [이미지 | 브랜드·모델·설명 → 스펙 3칸 → 성능 그래프 → 리뷰평점·주장점]
 * 하단: 제조사 제공 상세 이미지 HTML 그대로
 */
export default function TinfoView({ tinfo: t }: { tinfo: Tinfo }) {
  /* 성능 점수: 원본 막대 폭 = 점수 × 12px (0점이면 1px) → 0~10 점 */
  const scores = t.scores.map((s) => ({ label: s.label, value: s.width <= 1 ? 0 : Math.min(10, Math.round(s.width / 12)) }));
  const speed = t.speedRating.replace(/^[,\s]+/, "").replace(/,/g, " · ");

  return (
    <div className="w-[766px] self-start px-[8px] pb-[24px] pt-[28px] font-sans max-pc:w-full max-pc:px-[14px] max-pc:pt-[20px]">
      {/* 상단: 이미지 | 정보 */}
      <div className="grid grid-cols-[220px_1fr] gap-[32px] max-pc:grid-cols-1 max-pc:gap-[16px]">
        <div>
          <div className="flex h-[260px] items-center justify-center border border-line bg-white p-[12px] max-pc:h-[220px]">
            <img src={t.image} alt={t.model} className="max-h-full w-auto" />
          </div>
          {t.typeLevel && <p className="mt-[10px] text-center text-[12px] text-muted">{t.typeLevel.replace(/\s*\/\s*/, " · ")}</p>}
        </div>

        <div className="min-w-0">
          <p className="eyebrow">{t.brandName}</p>
          <h1 className="mt-[4px] text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-ink" style={NUM}>
            {t.model}
          </h1>
          {t.descHtml && (
            <p className="mt-[10px] text-[13px] leading-[22px] text-graphite [&_*]:text-[13px] [&_*]:text-graphite" dangerouslySetInnerHTML={{ __html: t.descHtml }} />
          )}

          {/* 스펙 3칸 */}
          <dl className="mt-[18px] grid grid-cols-3 border-y border-line max-pc:grid-cols-1">
            <Spec label="속도등급" value={speed || "-"} />
            <Spec label="트레드웨어" value={t.treadwear ? `${t.treadwear}` : "-"} sub="평균" className="border-x border-line max-pc:border-x-0 max-pc:border-y" />
            <Spec label="가격대" value={t.priceRange ? `${t.priceRange}원` : "-"} />
          </dl>

          {/* 성능 그래프 (2열) */}
          {scores.length > 0 && (
            <div className="mt-[18px]">
              <p className="eyebrow mb-[10px]">Performance</p>
              <ul className="grid grid-cols-2 gap-x-[24px] gap-y-[8px] max-pc:grid-cols-1">
                {scores.map((s) => (
                  <li key={s.label} className="flex items-center gap-[10px] text-[12px]">
                    <span className="w-[64px] shrink-0 text-graphite">{s.label}</span>
                    <span className="h-[6px] flex-1 bg-surface">
                      <span className="block h-full bg-ink" style={{ width: `${s.value * 10}%` }} />
                    </span>
                    <span className="w-[22px] shrink-0 text-right text-ink" style={NUM}>
                      {s.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 리뷰평점 / 주장점 */}
          <div className="mt-[18px] flex flex-wrap items-baseline gap-x-[28px] gap-y-[6px] border-t border-line pt-[14px] text-[13px]">
            {t.reviewScore && (
              <p className="text-graphite">
                리뷰평점{" "}
                <b className="ml-[4px] text-[18px] text-ink" style={NUM}>
                  {t.reviewScore}
                </b>
                <span className="ml-[2px] text-[11px] text-muted">/ 10</span>
              </p>
            )}
            {t.strongPoint && (
              <p className="text-graphite">
                주장점 <b className="ml-[4px] font-semibold text-ink">{t.strongPoint}</b>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 상세 내용 (제조사 제공 이미지 HTML 그대로) */}
      {t.contentHtml && (
        <>
          <div className="mt-[28px] mb-[20px] flex items-center gap-[12px]">
            <p className="eyebrow shrink-0">Detail</p>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="[&_center]:text-center [&_img]:inline-block max-pc:[&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: t.contentHtml }} />
        </>
      )}
    </div>
  );
}

function Spec({ label, value, sub, className = "" }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={`px-[14px] py-[10px] first:pl-0 last:pr-0 max-pc:px-0 ${className}`}>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-[2px] text-[14px] font-semibold text-ink" style={NUM}>
        {value}
        {sub && <span className="ml-[4px] text-[11px] font-normal text-muted">{sub}</span>}
      </dd>
    </div>
  );
}
