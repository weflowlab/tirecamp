import CsSideMenu from "@/components/cscenter/CsSideMenu";

/**
 * 고객센터(/cscenter/*) 공통 2단 프레임
 * - 좌측 200px: 타이틀 + 서브메뉴 / 우측: 각 페이지 내용 (얇은 세로선으로 구분)
 * - 모바일: 타이틀 + 가로 서브메뉴 위, 내용 아래
 */
export default function CsCenterLayout({ children }: LayoutProps<"/cscenter">) {
  return (
    <div className="flex w-full min-h-[480px] font-sans max-pc:flex-col">
      <aside className="w-[200px] shrink-0 border-r border-line pr-[24px] pt-[8px] max-pc:w-full max-pc:border-r-0 max-pc:pr-0 max-pc:pt-0">
        <p className="eyebrow">Customer Center</p>
        <h2 className="mb-[24px] mt-[6px] text-[24px] font-bold tracking-[-0.03em] text-ink max-pc:mb-[12px] max-pc:text-[20px]">고객센터</h2>
        <CsSideMenu />
      </aside>
      <section className="flex-1 min-w-0 pl-[40px] pt-[8px] max-pc:pl-0 max-pc:pt-[20px]">{children}</section>
    </div>
  );
}
