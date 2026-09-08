"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MAKERS } from "@/lib/tireSizeOptions";
import type { CarName, TireSizeRow } from "@/lib/carfind";


/**
 * 차량검색 (원본 form name="frmsize" + ajaxcarfind_mainonly.js)
 * - 자동차회사 선택 → 연식 select 표시 → 차종 select 표시 → 차량사진 + 타이어사이즈 목록
 * - /api/car/* 는 미리 긁어 둔 정적 JSON(data/carfind) 을 돌려주고, 차량사진도 public/siteimg 의 로컬 파일이다 (외부 요청 없음)
 * - 각 단계의 select 는 데이터가 도착하기 전까지 숨김 (원본 display:none 과 동일)
 * - 상위 단계를 바꾸면 하위 단계는 모두 초기화 (deleteCarYears/deleteCarNames/cftblvisible_off)
 */
export default function CarFinder({ tinfo }: { tinfo?: string }) {
  const [maker, setMaker] = useState("NO");
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState("NO");
  const [cars, setCars] = useState<CarName[]>([]);
  const [car, setCar] = useState("NO");
  const [carimg, setCarimg] = useState<string | null>(null);
  const [sizes, setSizes] = useState<TireSizeRow[]>([]);

  /* 늦게 도착한 이전 요청 응답을 무시하기 위한 카운터 */
  const reqSeq = useRef(0);

  /* 연식/차종/사이즈 초기화 (원본 deleteCarYears + deleteCarNames + cftblvisible_off) */
  function resetYears() {
    setYears([]);
    setYear("NO");
    resetCars();
  }
  function resetCars() {
    setCars([]);
    setCar("NO");
    resetSizes();
  }
  function resetSizes() {
    setCarimg(null);
    setSizes([]);
  }

  /* 자동차회사 변경 → 연식 목록 조회 (원본 populateCarYears) */
  async function onMakerChange(code: string) {
    setMaker(code);
    resetYears();
    if (code === "NO") return;
    const seq = ++reqSeq.current;
    try {
      const res = await fetch(`/api/car/years?makercode=${code}`);
      const data = (await res.json()) as { years: string[] };
      if (seq !== reqSeq.current) return;
      setYears(data.years ?? []);
    } catch {
      /* 원본과 동일하게 실패 시 조용히 무시 */
    }
  }

  /* 연식 변경 → 차종 목록 조회 (원본 populateCarNames) */
  async function onYearChange(y: string) {
    setYear(y);
    resetCars();
    if (maker === "NO" || y === "NO") return;
    const seq = ++reqSeq.current;
    try {
      const res = await fetch(`/api/car/names?makercode=${maker}&syear=${y}`);
      const data = (await res.json()) as { cars: CarName[] };
      if (seq !== reqSeq.current) return;
      setCars(data.cars ?? []);
    } catch {
      /* 무시 */
    }
  }

  /* 차종 변경 → 사진 + 사이즈 목록 조회 (원본 populateSizeList('0') + cftblvisible_on) */
  async function onCarChange(c: string) {
    setCar(c);
    resetSizes();
    if (maker === "NO" || year === "NO" || c === "NO") return;
    const seq = ++reqSeq.current;
    try {
      const res = await fetch(`/api/car/sizes?makercode=${maker}&syear=${year}&carcode=${c}`);
      const data = (await res.json()) as { carimg: string | null; sizes: TireSizeRow[] };
      if (seq !== reqSeq.current) return;
      setCarimg(data.carimg ?? null);
      setSizes(data.sizes ?? []);
    } catch {
      /* 무시 */
    }
  }

  /* 차량사진/사이즈 영역 표시 여부 (원본 idtrcarpic / idpcartbl) */
  const showCarTable = car !== "NO";

  /* 모바일: select 를 한 줄씩 블록으로 (폭은 셀 폭에 맞춤) */
  const SEL_MOBILE = "max-pc:block max-pc:w-full max-pc:mb-[6px]";

  return (
    /* 모바일(.m-stack): 타이틀 → select 들 → 차량사진 → 사이즈 목록 순으로 세로 배치 */
    <table width={870} cellSpacing={0} cellPadding={0} style={{ border: 0 }} className="m-stack">
      <tbody>
        {/* 1행: 차량검색 타이틀 + 회사/연식/차종 select */}
        <tr>
          <td height={50} width={212} align="left" valign="middle" className="max-pc:pb-[8px]">
            <div className="font-sans">
              <p className="eyebrow">By Car</p>
              <p className="mt-[2px] text-[15px] font-semibold tracking-[-0.01em] text-ink">차종으로 타이어 검색</p>
            </div>
          </td>
          <td height={50} width={658} align="left">
            <table width={648} style={{ height: 36 }} cellSpacing={0} cellPadding={0} className="m-stack">
              <tbody>
                <tr>
                  <td height={34} width={455} valign="middle" className="whitespace-nowrap max-pc:whitespace-normal max-pc:pb-[4px]">
                    {/* 자동차회사 select (원본 selmaker, 150px) */}
                    <select
                      name="selmaker"
                      className={`field !h-[38px] !w-[160px] !pl-[10px] !pr-[30px] !text-[13px] ${SEL_MOBILE}`}

                      value={maker}
                      onChange={(e) => onMakerChange(e.target.value)}
                    >
                      <option value="NO">자동차회사 선택</option>
                      {MAKERS.map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.name}
                        </option>
                      ))}
                    </select>{" "}
                    {/* 연식 select (원본 selsyear, 80px) — 데이터 도착 후 표시 */}
                    <select
                      name="selsyear"
                      className={`field !h-[38px] !w-[96px] !pl-[10px] !pr-[30px] !text-[13px] ${SEL_MOBILE}`}
                      style={{ display: years.length ? "" : "none" }}
                      value={year}
                      onChange={(e) => onYearChange(e.target.value)}
                    >
                      <option value="NO">차량연식</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>{" "}
                    {/* 차종 select (원본 selcar, 200px, 앞 &nbsp;&nbsp; 간격은 ml 로) — 데이터 도착 후 표시 */}
                    <select
                      name="selcar"
                      className={`field !h-[38px] !w-[210px] !pl-[10px] !pr-[30px] !text-[13px] ml-[4px] max-pc:ml-0 ${SEL_MOBILE}`}
                      style={{ display: cars.length ? "" : "none" }}
                      value={car}
                      onChange={(e) => onCarChange(e.target.value)}
                    >
                      <option value="NO">차량을 선택하세요</option>
                      {cars.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td height={34} width={193} valign="middle" />
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        {/* 2행: 차량사진 + 타이어사이즈 목록 (원본 idtrcarpic, 차종 선택 시에만 표시) */}
        {showCarTable && (
          <tr>
            <td height={10} width={212} align="center" />
            <td height={10} width={658} align="left">
              <table width={621} style={{ height: 137 }} cellSpacing={0} cellPadding={0} className="m-stack">
                <tbody>
                  <tr>
                    {/* 차량사진 (원본 pcarphoto, 221x165) */}
                    <td height={124} width={227} align="center" valign="top" className="max-pc:pb-[8px]">
                      {carimg && <img src={carimg} alt="" width={221} height={165} />}
                    </td>
                    <td height={124} width={12} align="center" valign="top">

                    </td>
                    {/* 타이어사이즈 목록 (원본 idsizelisttd, tsizeCallback 이 생성하는 table) */}
                    <td height={124} width={385} align="left" valign="top" className="max-pc:pb-[8px]">
                      {sizes.length > 0 && (
                        <table width={306} style={{ height: 35 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                          <tbody>
                            {sizes.map((s, i) => (
                              <SizeRow key={`${s.ftsize}-${s.rtsize}-${s.oesize}-${i}`} row={s} tinfo={tinfo} />
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/**
 * 타이어사이즈 한 줄 (원본: hover 시 배경 #E4E4E4, 앞뒤 다르면 "F:.. • R:.." 표시)
 * seetirebut 버튼 → /product/tire/sizelist?find_ftsize=..(&find_rtsize=.. 앞뒤 다를 때만)
 */
function SizeRow({ row, tinfo }: { row: TireSizeRow; tinfo?: string }) {
  const differ = row.frtype === "2";
  const href =
    `/product/tire/sizelist?find_ftsize=${encodeURIComponent(row.ftsize)}` +
    (differ ? `&find_rtsize=${encodeURIComponent(row.rtsize)}` : "") +
    (tinfo ? `&tinfo=${tinfo}` : "");

  return (
    <tr className="border-b border-line font-sans hover:bg-surface">
      <td height={38} width={193} align="left" className="pl-[8px]">
        <span className="text-[14px] font-semibold text-ink" style={{ fontFamily: "var(--font-num)" }}>
          {differ ? (
            <>
              <span className="mr-[4px] text-[10px] font-normal text-muted">F</span>
              {row.ftsizev}
              <span className="ml-[10px] mr-[4px] text-[10px] font-normal text-muted">R</span>
              {row.rtsizev}
            </>
          ) : (
            row.ftsizev
          )}
        </span>
      </td>
      <td height={38} width={109} align="right" className="pr-[8px]">
        <Link href={href} className="btn-outline !h-[28px] !px-[12px] !text-[12px] !text-ink hover:bg-ink hover:!text-white hover:!no-underline">
          타이어 보기
        </Link>
      </td>
    </tr>
  );
}
