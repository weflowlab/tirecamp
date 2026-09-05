"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INCHES, RATIOS, WIDTHS } from "@/lib/tireSizeOptions";
import TireSizeHelpDialog from "@/components/tire/TireSizeHelpDialog";

/* 굴림 10pt select 공통 스타일 (원본 inline style) */
const SEL_FONT = { fontFamily: "굴림, 'Nanum Gothic', sans-serif", fontSize: "10pt" } as const;

/* 단면폭/편평비/인치 한 세트 */
type SizeSel = { w: string; t: string; i: string };
const EMPTY: SizeSel = { w: "NO", t: "NO", i: "NO" };

/**
 * 사이즈검색 (원본 form name="frmtsize" + findSize()/frtypechk())
 * - 단면폭/편평비/인치 select 3개, "앞뒤사이즈가 다른경우" 체크 시 두번째 줄 표시
 * - 검색 버튼: 원본과 동일한 alert 검증 후 /product/tire/sizelist?find_ftsize=..(&find_rtsize=..) 로 이동
 * - tsizehelp.gif 버튼: "타이어사이즈 확인방법" 모달 열기
 */
export default function SizeFinder() {
  const router = useRouter();
  const [front, setFront] = useState<SizeSel>(EMPTY);
  const [rear, setRear] = useState<SizeSel>(EMPTY);
  const [frchk, setFrchk] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  /* 체크박스 토글 (원본 frtypechk): 해제 시 두번째 줄 select 초기화 */
  function onFrchk(checked: boolean) {
    setFrchk(checked);
    if (!checked) setRear(EMPTY);
  }

  const isEmpty = (s: SizeSel) => s.w === "NO" || s.t === "NO" || s.i === "NO";
  const toCode = (s: SizeSel) => s.w + s.t + s.i; // 원본: 단면폭+편평비+인치 숫자 이어붙임

  /* 검색 (원본 findSize) */
  function findSize() {
    let url = "";
    if (frchk) {
      if (isEmpty(front)) {
        alert("앞타이어 사이즈를 선택하셔야 합니다.");
        return;
      }
      if (isEmpty(rear)) {
        alert("뒤타이어 사이즈를 선택하셔야 합니다.");
        return;
      }
      url = `/product/tire/sizelist?find_ftsize=${toCode(front)}&find_rtsize=${toCode(rear)}`;
    } else {
      if (isEmpty(front)) {
        alert("사이즈를 선택하셔야 합니다.");
        return;
      }
      url = `/product/tire/sizelist?find_ftsize=${toCode(front)}`;
    }
    router.push(url);
  }

  return (
    <>
      {/* 모바일(.m-stack): 타이틀 → select/체크박스 → 검색버튼 → 사이즈 확인방법 버튼 순으로 세로 배치 */}
      <table width={871} style={{ height: 63 }} cellSpacing={0} cellPadding={0} className="m-stack">
        <tbody>
          <tr>
            {/* 사이즈검색 타이틀 */}
            <td height={63} width={212} align="left" valign="top">
              <img src="/images/main/new/title/sizefindtitle.gif" alt="사이즈검색" width={197} height={45} />
            </td>
            {/* select 3개 x (1~2줄) + 체크박스 + 검색버튼 */}
            <td height={63} width={457} align="left">
              <table width={407} style={{ height: 52 }} cellSpacing={0} cellPadding={0} className="m-stack">
                <tbody>
                  <tr>
                    <td height={52} width={249} valign="top">
                      <table width={237} style={{ height: 10 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                        <tbody>
                          {/* 1줄: 앞(또는 전체) 사이즈 */}
                          <tr>
                            <td height={25} width={237} align="left">
                              <SizeSelects idx={1} value={front} onChange={setFront} />
                            </td>
                          </tr>
                          {/* 2줄: 뒤 사이즈 (원본 idrtypetr, 체크 시에만 표시) */}
                          {frchk && (
                            <tr>
                              <td height={25} width={237} align="left" valign="bottom">
                                <SizeSelects idx={2} value={rear} onChange={setRear} />
                              </td>
                            </tr>
                          )}
                          {/* 3줄: 앞뒤사이즈가 다른경우 체크박스 (8pt) */}
                          <tr>
                            <td height={25} width={237} align="left" valign="middle">
                              <label style={{ fontSize: "8pt" }} className="cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="frchk"
                                  value="2"
                                  checked={frchk}
                                  onChange={(e) => onFrchk(e.target.checked)}
                                  className="align-middle"
                                />
                                앞뒤사이즈가 다른경우
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    {/* 검색 버튼 이미지 (134x44) */}
                    <td height={52} width={158} valign="top" align="center" className="max-pc:pt-[4px] max-pc:pb-[6px]">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          findSize();
                        }}
                      >
                        <img src="/jwtsm_comimg/tirekong2000/20260520091818416100.gif" alt="검색" width={134} height={44} />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            {/* 타이어사이즈 확인방법 버튼 (원본 idtiresizepds → jQuery UI dialog) */}
            <td height={63} width={203} align="left" valign="top" className="max-pc:text-center max-pc:pb-[6px]">
              <div className="h-[3px]" />
              &nbsp;
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setHelpOpen(true);
                }}
              >
                <img src="/images/main/new/tsizehelp.gif" alt="타이어사이즈 확인방법" width={175} height={40} className="inline-block" />
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 타이어사이즈 확인방법 모달 */}
      <TireSizeHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

/**
 * 단면폭/편평비/인치 select 3개 묶음 (원본 selwsize{n}/seltsize{n}/selinch{n})
 */
function SizeSelects({ idx, value, onChange }: { idx: 1 | 2; value: SizeSel; onChange: (v: SizeSel) => void }) {
  return (
    <>
      <select
        name={`selwsize${idx}`}
        className="sel10"
        style={SEL_FONT}
        value={value.w}
        onChange={(e) => onChange({ ...value, w: e.target.value })}
      >
        <option value="NO">단면폭</option>
        {WIDTHS.map((w) => (
          <option key={w} value={String(w)}>
            {w}
          </option>
        ))}
      </select>{" "}
      <select
        name={`seltsize${idx}`}
        className="sel10"
        style={SEL_FONT}
        value={value.t}
        onChange={(e) => onChange({ ...value, t: e.target.value })}
      >
        <option value="NO">편평비</option>
        {RATIOS.map((t) => (
          <option key={t} value={String(t)}>
            {t}
          </option>
        ))}
      </select>{" "}
      <select
        name={`selinch${idx}`}
        className="sel10"
        style={SEL_FONT}
        value={value.i}
        onChange={(e) => onChange({ ...value, i: e.target.value })}
      >
        <option value="NO">인치</option>
        {INCHES.map((i) => (
          <option key={i} value={String(i)}>
            {i}
          </option>
        ))}
      </select>
    </>
  );
}
