/**
 * 페이지 공통 타이틀 — (한글) 라벨 → 제목 → 부제 → 얇은 선
 * 영문 라벨은 전부 걷어냈다. eyebrow 는 한글 라벨이 필요할 때만 넘긴다.
 */
/* sub 는 문자열 외에 <br className="hidden max-pc:block" /> 같은 조각도 받는다 (모바일 줄바꿈 고정용) */
export default function PageTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: React.ReactNode }) {
  return (
    <div className="w-full mb-[36px] border-b border-line pb-[24px] pt-[8px] font-sans max-pc:mb-[24px] max-pc:pb-[18px]">
      {eyebrow && <p className="eyebrow mb-[10px]">{eyebrow}</p>}
      <h1 className="text-[30px] font-bold tracking-[-0.03em] text-ink leading-[1.2] max-pc:text-[24px]">{title}</h1>
      {sub && <p className="mt-[10px] text-[15px] leading-[24px] text-muted max-pc:text-[14px]">{sub}</p>}
    </div>
  );
}
