"use client";

import type { ListFilter } from "@/lib/tprodintro";
import { LEVELS, TYPES } from "@/lib/tprodintro";
import { BRANDS } from "@/lib/tireSizeOptions";

const DOTUM = "돋움, 'Nanum Gothic', sans-serif";

type Props = {
  filter: ListFilter;
  onBrand: (code: string) => void; // 원본 selbrand(c)
  onType: (code: string) => void; // 원본 seltype(c)
  onLevel: (code: string) => void; // 원본 sellevel(c)
};

/** 양옆 갈색(#c44b1c) 꺾쇠 장식 (원본 10x183 테이블: 모서리 5x5 + 세로 5x173 바) */
function Bracket({ side }: { side: "left" | "right" }) {
  return (
    <table className="w-[10px]">
      <tbody>
        <tr>
          <td className="h-[5px] w-[5px] bg-[#c44b1c]"></td>
          <td className="h-[5px] w-[5px] bg-[#c44b1c]"></td>
        </tr>
        <tr>
          <td className={`h-[173px] w-[5px] ${side === "left" ? "bg-[#c44b1c]" : ""}`}></td>
          <td className={`h-[173px] w-[5px] ${side === "right" ? "bg-[#c44b1c]" : ""}`}></td>
        </tr>
        <tr>
          <td className="h-[5px] w-[5px] bg-[#c44b1c]"></td>
          <td className="h-[5px] w-[5px] bg-[#c44b1c]"></td>
        </tr>
      </tbody>
    </table>
  );
}

/** 타입별/등급별 링크 한 줄 (첫 칸 79px '전체', 이후 131px 씩, 빈 칸은 '　') */
function LinkRow({
  options,
  current,
  onSelect,
}: {
  options: { code: string; name: string }[];
  current: string;
  onSelect: (code: string) => void;
}) {
  const cells = [{ code: "", name: "전체" }, ...options];
  while (cells.length < 6) cells.push({ code: "__empty" + cells.length, name: "" });
  return (
    /* 모바일(.m-wrap): 한 줄에 3개씩, 빈 칸은 숨김 */
    <table className="w-[734px] m-wrap">
      <tbody>
        <tr>
          {cells.map((c, i) => (
            <td
              key={c.code}
              className={`h-[30px] text-center ${i === 0 ? "w-[79px]" : "w-[131px]"} ${
                c.code.startsWith("__empty") ? "max-pc:hidden" : "max-pc:basis-1/3 max-pc:py-[4px]"
              }`}
            >
              {c.code.startsWith("__empty") ? (
                "　"
              ) : (
                <a
                  href={`#${c.code}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(c.code);
                  }}
                  className="hover:no-underline"
                  aria-current={current === c.code ? "true" : undefined}
                  style={{ fontFamily: DOTUM, fontSize: i === 0 ? undefined : "9pt" }}
                >
                  {c.name}
                </a>
              )}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

/**
 * 필터 박스 (원본 900x180 테이블)
 * - 제조사별: 전체 + 10개 브랜드 체크박스 2행 (선택 로직은 부모의 selbrand)
 * - 타입별: 전체/승용차용/SUV/RV/겨울용 링크
 * - 등급별: 전체/프리미엄/최고급형/고급형/일반형/출고용(OE) 링크
 */
export default function FilterBox({ filter, onBrand, onType, onLevel }: Props) {
  const allChecked = filter.brands.length === 0;
  const row1 = BRANDS.slice(0, 5);
  const row2 = BRANDS.slice(5, 10);
  const brandCellWidths = ["w-[130px]", "w-[129px]", "w-[131px]", "w-[131px]", "w-[131px]"];

  const brandCell = (b: { code: string; name: string }, i: number) => (
    <td key={b.code} className={`h-[25px] text-center ${brandCellWidths[i]} max-pc:basis-1/3 max-pc:py-[3px]`}>
      <table className="w-[86px] max-pc:w-full">
        <tbody>
          <tr>
            <td className="h-[17px] w-[86px] text-left whitespace-nowrap">
              <input type="checkbox" name="brandop" value={b.code} checked={filter.brands.includes(b.code)} onChange={() => onBrand(b.code)} className="align-middle" />
              {b.name}
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );

  return (
    /* 모바일: 양옆 꺾쇠(높이 183px 고정)는 숨기고 내용 셀에 5px 갈색 좌우 선으로 대체, 라벨/내용은 세로 배치 */
    <table className="w-[900px] m-fluid">
      <tbody>
        <tr>
          <td className="h-[180px] w-[19px] align-middle max-pc:hidden">
            <Bracket side="left" />
          </td>
          <td className="h-[180px] w-[865px] text-center align-middle max-pc:border-x-[5px] max-pc:border-[#c44b1c] max-pc:px-[6px] max-pc:py-[4px]">
            <table className="w-[848px] mx-auto m-stack">
              <tbody>
                {/* 제조사별 */}
                <tr>
                  <td className="h-[66px] w-[100px] text-center align-middle max-pc:pt-[6px]">
                    <table className="w-[85px] mx-auto">
                      <tbody>
                        <tr>
                          <td className="h-[25px] w-[85px] text-center">
                            <b style={{ fontFamily: DOTUM, color: "#939393" }}>제조사별</b>
                          </td>
                        </tr>
                        <tr>
                          <td className="h-[25px] w-[85px] text-center max-pc:hidden">　</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="h-[66px] w-[748px] text-center align-middle max-pc:pb-[6px]">
                    {/* 모바일(.m-wrap): 체크박스 한 줄에 3개씩 */}
                    <table className="w-[734px] mx-auto m-wrap">
                      <tbody>
                        <tr>
                          <td className="h-[25px] w-[79px] text-center whitespace-nowrap max-pc:basis-1/3 max-pc:py-[3px]">
                            <input type="checkbox" name="brandop" value="all" checked={allChecked} onChange={() => onBrand("all")} className="align-middle" />
                            <span style={{ fontFamily: DOTUM }}>전체</span>
                          </td>
                          {row1.map(brandCell)}
                        </tr>
                        <tr>
                          <td className="h-[25px] w-[79px] text-center max-pc:hidden">　</td>
                          {row2.map(brandCell)}
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                {/* 구분선 (botline.gif) — 모바일에서는 셀 높이가 0 이 되므로 안쪽 3px div 로 높이 확보 */}
                <tr>
                  <td colSpan={2} className="h-[3px] w-[848px]" style={{ background: "url(/images/findsize/botline.gif)" }}>
                    <div className="h-[3px]" />
                  </td>
                </tr>
                {/* 타입별 */}
                <tr>
                  <td className="h-[43px] w-[100px] text-center align-middle max-pc:pt-[8px]">
                    <b style={{ fontFamily: DOTUM, color: "#939393" }}>타입별</b>
                  </td>
                  <td className="h-[43px] w-[748px] text-center align-middle max-pc:pb-[6px]">
                    <LinkRow options={TYPES} current={filter.type} onSelect={onType} />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="h-[3px] w-[848px]" style={{ background: "url(/images/findsize/botline.gif)" }}>
                    <div className="h-[3px]" />
                  </td>
                </tr>
                {/* 등급별 */}
                <tr>
                  <td className="h-[43px] w-[100px] text-center align-middle max-pc:pt-[8px]">
                    <b style={{ fontFamily: DOTUM, color: "#939393" }}>등급별</b>
                  </td>
                  <td className="h-[43px] w-[748px] text-center align-middle max-pc:pb-[6px]">
                    <LinkRow options={LEVELS} current={filter.level} onSelect={onLevel} />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td className="h-[180px] w-[18px] align-middle max-pc:hidden">
            <Bracket side="right" />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
