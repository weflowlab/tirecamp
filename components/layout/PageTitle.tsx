/**
 * 페이지 공통 타이틀 — 영문 eyebrow → 제목 → 부제 → 얇은 선
 */
export default function PageTitle({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="w-full mb-[36px] border-b border-line pb-[24px] pt-[8px] font-sans max-pc:mb-[24px] max-pc:pb-[18px]">
      {eyebrow && <p className="eyebrow mb-[10px]">{eyebrow}</p>}
      <h1 className="text-[30px] font-bold tracking-[-0.03em] text-ink leading-[1.2] max-pc:text-[24px]">{title}</h1>
      {sub && <p className="mt-[10px] text-[14px] leading-[24px] text-muted max-pc:text-[13px]">{sub}</p>}
    </div>
  );
}
