"use client";

import type { TireListItem } from "@/lib/tprodintro";
import { openTireInfo } from "@/components/tire/tireInfoWin";

/**
 * 타이어 카드 한 장 (원본 <td 224x364> 안의 209px 테이블, 1px #DBDBDB 테두리)
 * - 상품 이미지 (클릭 → tireinfowin(seq) 팝업)
 * - 브랜드 로고 /images/companylogo/<code>.gif
 * - 회색(#EEEEEE) 박스: "타입 | 등급" / 가격대
 */
export default function TireCard({ item }: { item: TireListItem }) {
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    openTireInfo(item.seq);
  };

  return (
    <td className="h-[364px] w-[224px] text-center align-top">
      <table className="w-[209px] mx-auto border border-[#DBDBDB]">
        <tbody>
          <tr>
            <td className="h-[246px] w-[208px] text-center align-top">
              <a href={`/product/tinfo/view?tinfoseq=${item.seq}`} onClick={open}>
                <img src={item.image} alt="" className="inline-block" />
              </a>
            </td>
          </tr>
          <tr>
            <td className="h-[45px] w-[208px] text-center align-middle">
              <img src={`/images/companylogo/${item.brandCode}.gif`} alt={item.brandName} className="inline-block" />
            </td>
          </tr>
          <tr>
            <td className="h-[52px] w-[208px] text-center bg-[#EEEEEE]">
              <table className="w-[197px] mx-auto">
                <tbody>
                  <tr>
                    <td className="h-[21px] w-[197px] text-center">
                      <span style={{ fontFamily: "돋움, 'Nanum Gothic', sans-serif" }}>
                        {item.typeLabel} | {item.levelLabel}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="h-[21px] w-[197px] text-center">
                      <b>
                        <span style={{ fontFamily: "Arial, sans-serif" }}>{item.price}</span>
                      </b>
                      원
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  );
}
