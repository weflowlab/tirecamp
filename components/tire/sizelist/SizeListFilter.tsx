"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WIDTHS, RATIOS, INCHES } from "@/lib/tireSizeOptions";
import { buildSizeListHref, splitSize, type SizeListQuery } from "@/lib/sizelistQuery";

/* 원본 제조사 체크박스 순서/표기 (brandop value, 2행 5열) */
const BRAND_ROW1: [string, string][] = [
  ["10", "한국"],
  ["14", "금호"],
  ["16", "넥센"],
  ["20", "미쉐린"],
  ["21", "브리지스톤"],
];
const BRAND_ROW2: [string, string][] = [
  ["22", "피렐리"],
  ["23", "콘티넨탈"],
  ["28", "던롭"],
  ["26", "굳이어"],
  ["24", "요코하마"],
];

/* 원본 <font face="돋움"> 대응 글꼴 (select 는 globals.css 의 .sel10 = 굴림 10pt) */
const DOTUM = "돋움, Dotum, 'Nanum Gothic', sans-serif";

type Props = { query: SizeListQuery };

/**
 * 회색 필터 박스 (원본 sizelist.aspx 의 form name="frm" 상단 테이블)
 *  1) 타이어 사이즈 — 사이즈확인 및 재검색 (findSubmit / frtypechk)
 *  2) 타이어 정렬방법 라디오 (sortpost)
 *  3) 타이어 제조사 체크박스 (selbrand)
 * 모든 변경은 URL query 로 반영(router.push) → 서버가 원본에 재POST (원본의 form submit 과 동일)
 */
export default function SizeListFilter({ query }: Props) {
  const router = useRouter();
  const ft = splitSize(query.ftsize);
  const rt = splitSize(query.rtsize);
  const frDiff = !!query.rtsize && query.rtsize !== query.ftsize;

  /* 앞타이어 select 3개 */
  const [w1, setW1] = useState(ft?.width ?? "NO");
  const [r1, setR1] = useState(ft?.ratio ?? "NO");
  const [i1, setI1] = useState(ft?.inch ?? "NO");
  /* 뒤타이어 select 3개 (앞뒤사이즈가 다르면 체크 시 노출) */
  const [w2, setW2] = useState(frDiff ? (rt?.width ?? "NO") : "NO");
  const [r2, setR2] = useState(frDiff ? (rt?.ratio ?? "NO") : "NO");
  const [i2, setI2] = useState(frDiff ? (rt?.inch ?? "NO") : "NO");
  const [frchk, setFrchk] = useState(frDiff);

  /* 페이지 리셋(findfristchk=pagereset) 후 이동 — 원본 sortpost()/finddata() */
  function go(next: Partial<SizeListQuery>) {
    router.push(buildSizeListHref({ ...query, spage: 1, lpage: 1, ...next }));
  }

  /* 원본 frtypechk(): 체크 해제 시 뒤타이어 select 초기화 */
  function frtypechk(checked: boolean) {
    setFrchk(checked);
    if (!checked) {
      setW2("NO");
      setR2("NO");
      setI2("NO");
    }
  }

  /* 원본 findSubmit(1): 사이즈 검증 후 재검색 (정렬/브랜드/탭 유지, 페이지 리셋) */
  function findSubmit() {
    if (frchk) {
      if (w1 === "NO" || r1 === "NO" || i1 === "NO") {
        alert("앞타이어 사이즈를 선택하셔야 합니다.");
        return;
      }
      if (w2 === "NO" || r2 === "NO" || i2 === "NO") {
        alert("뒤타이어 사이즈를 선택하셔야 합니다.");
        return;
      }
      go({ ftsize: w1 + r1 + i1, rtsize: w2 + r2 + i2 });
    } else {
      if (w1 === "NO" || r1 === "NO" || i1 === "NO") {
        alert("사이즈를 선택하셔야 합니다.");
        return;
      }
      const s = w1 + r1 + i1;
      go({ ftsize: s, rtsize: s });
    }
  }

  /* 원본 sortpost(): 정렬 라디오 변경 즉시 재조회 */
  function sortpost(v: string) {
    go({ sorttireop: v });
  }

  /* 원본 selbrand(c): 전체브랜드 ↔ 개별 브랜드 상호 배타 처리 후 재조회 */
  function selbrand(code: string) {
    const allChecked = query.brandop.length === 0;
    if (code === "all") {
      // 전체가 이미 체크 상태에서 다시 누르면 해제 불가(원본: 강제로 다시 체크, 조회 안 함)
      if (allChecked) return;
      go({ brandop: [] });
    } else {
      const set = new Set(query.brandop);
      if (set.has(code)) set.delete(code);
      else set.add(code);
      go({ brandop: [...set] });
    }
  }

  const sortRadio = (value: string, label: string, trailing = "") => (
    <>
      <input type="radio" name="sorttireop" value={value} checked={query.sorttireop === value} onChange={() => sortpost(value)} />
      {label}
      {trailing}
    </>
  );

  const brandCell = (code: string, label: string, width: number, height: number) => (
    <td key={code} height={height} width={width}>
      <input type="checkbox" name="brandop" value={code} checked={query.brandop.includes(code)} onChange={() => selbrand(code)} />
      <span style={{ fontFamily: DOTUM }}>{label}</span>
    </td>
  );

  /* 단면폭/편평비/인치 select 3개 묶음 */
  const sizeSelects = (
    w: string,
    r: string,
    i: string,
    setW: (v: string) => void,
    setR: (v: string) => void,
    setI: (v: string) => void,
    suffix: string,
  ) => (
    <>
      <select name={`selwsize${suffix}`} className="sel10" value={w} onChange={(e) => setW(e.target.value)}>
        <option value="NO">단면폭</option>
        {WIDTHS.map((v) => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>{" "}
      <select name={`seltsize${suffix}`} className="sel10" value={r} onChange={(e) => setR(e.target.value)}>
        <option value="NO">편평비</option>
        {RATIOS.map((v) => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>{" "}
      <select name={`selinch${suffix}`} className="sel10" value={i} onChange={(e) => setI(e.target.value)}>
        <option value="NO">인치</option>
        {INCHES.map((v) => (
          <option key={v} value={String(v)}>{v}</option>
        ))}
      </select>
    </>
  );

  return (
    <table border={0} width={900} cellSpacing={0} cellPadding={0} style={{ height: 10, border: "1px solid #C0C0C0" }}>
      <tbody>
        {/* (1) 타이어 사이즈 — 사이즈확인 및 재검색 */}
        <tr>
          <td height={65} width={118} style={{ backgroundColor: "#F5F5F5" }}>
            <span style={{ fontFamily: "Arial", fontSize: "7pt", color: "#000" }}>&nbsp;&nbsp;</span>
            <span style={{ fontFamily: "Arial", fontSize: 11, color: "#000" }}>▼</span>
            <span style={{ fontSize: 11, fontFamily: DOTUM, color: "#000" }}> 타이어 사이즈</span>
          </td>
          <td height={65} width={10}></td>
          <td height={65} width={770}>
            <table border={0} cellSpacing={0} cellPadding={0} style={{ height: 10 }} width={690}>
              <tbody>
                <tr>
                  <td height={25} width={25} align="center">
                    {/* 원본 jQuery UI 아이콘 .ui-icon.ui-icon-circle-check (스프라이트 -208px -192px) */}
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        verticalAlign: "middle",
                        background: "url(/style/jq/css/images/ui-icons_222222_256x240.png) no-repeat -208px -192px",
                      }}
                    />
                  </td>
                  <td height={25} width={149} align="left" valign="middle">
                    <span style={{ fontSize: "small" }}>사이즈확인 및 재검색</span> :
                  </td>
                  <td height={50} width={273} rowSpan={2} align="left" valign="middle">
                    <table border={0} width={230} cellSpacing={0} cellPadding={0} style={{ height: 25 }}>
                      <tbody>
                        <tr>
                          <td height={25} width={230} align="center">
                            {sizeSelects(w1, r1, i1, setW1, setR1, setI1, "1")}
                          </td>
                        </tr>
                        {/* 원본 tr#idrtypetr — frchk 체크 시에만 표시 */}
                        <tr id="idrtypetr" style={{ display: frchk ? undefined : "none" }}>
                          <td height={25} width={230} align="center">
                            {sizeSelects(w2, r2, i2, setW2, setR2, setI2, "2")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td height={50} width={243} rowSpan={2} align="left" valign="top">
                    {/* 검색 버튼 이미지 (원본 findSubmit(1)) */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        findSubmit();
                      }}
                    >
                      <img src="/jwtsm_comimg/tirekong2000/20260520091818416100.gif" alt="검색" width={134} height={44} style={{ border: 0 }} />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td height={25} width={25} align="center" valign="top"></td>
                  <td height={25} width={149} align="left" valign="top">
                    <span style={{ fontSize: "8pt" }}>
                      <input type="checkbox" name="frchk" value="2" checked={frchk} onChange={(e) => frtypechk(e.target.checked)} />
                      <span className="font11px" style={{ color: "#3366CC" }}>앞뒤사이즈가 다르면</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td height={1} width={898} style={{ backgroundColor: "#E0E0E0" }} colSpan={3}></td>
        </tr>

        {/* (2) 타이어 정렬방법 */}
        <tr>
          <td height={40} width={118} style={{ backgroundColor: "#F5F5F5" }}>
            <span style={{ fontFamily: "Arial", fontSize: "7pt", color: "#000" }}>&nbsp;&nbsp;</span>
            <span style={{ fontFamily: "Arial", fontSize: 9, color: "#000" }}>▼</span>
            <span style={{ fontSize: 11, fontFamily: DOTUM, color: "#000" }}> 타이어 정렬방법</span>
          </td>
          <td height={40} width={10}>　</td>
          <td height={40} width={770}>
            <span style={{ fontFamily: DOTUM, color: "#676767" }}>{sortRadio("2", "낮은 가격순 ")}</span>
            <span style={{ fontFamily: DOTUM, color: "#FF9797" }}>▼&nbsp; </span>
            <span style={{ fontFamily: DOTUM, color: "#676767" }}>{sortRadio("3", "높은 가격순 ")}</span>
            <span style={{ fontFamily: DOTUM, color: "#A2A2FF" }}>▲&nbsp;&nbsp; |&nbsp;&nbsp; </span>
            <span style={{ fontFamily: DOTUM, color: "#676767" }}>
              {sortRadio("1", "브랜드별", " ")}
              {sortRadio("5", "승차감,정숙성 우선", " ")}
              {sortRadio("6", "접지력,고속주행 우선", " ")}
              {sortRadio("4", "제품수명 긴거 우선")}
            </span>
          </td>
        </tr>

        {/* (3) 타이어 제조사 */}
        <tr>
          <td height={47} width={118} style={{ backgroundColor: "#F5F5F5" }}>
            <span style={{ fontFamily: "Arial", fontSize: "7pt", color: "#000" }}>&nbsp;</span>
            <span style={{ fontFamily: "Arial", fontSize: 9, color: "#000" }}> ▼</span>
            <span style={{ fontSize: 11, fontFamily: DOTUM, color: "#000" }}>
              {" "}타이어 제조사<br />
              <br />
            </span>
          </td>
          <td height={47} width={10}>　</td>
          <td height={47} width={770}>
            <table border={0} width={673} style={{ height: 47 }} cellSpacing={0} cellPadding={0}>
              <tbody>
                <tr>
                  <td height={23} width={115}>
                    <input type="checkbox" name="brandop" value="all" checked={query.brandop.length === 0} onChange={() => selbrand("all")} />
                    <span style={{ fontFamily: DOTUM, color: "#000080" }}>전체브랜드</span>
                  </td>
                  {BRAND_ROW1.map(([c, l], i) => brandCell(c, l, i < 2 ? 111 : 112, 23))}
                </tr>
                <tr>
                  <td height={24} width={115}>　</td>
                  {BRAND_ROW2.map(([c, l], i) => brandCell(c, l, i < 2 ? 111 : 112, 24))}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
