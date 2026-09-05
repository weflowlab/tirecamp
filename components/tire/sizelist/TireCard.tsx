"use client";

import { useState } from "react";
import { openTireInfo } from "@/components/tire/tireInfoWin";
import type { SizeBlock, TireItem } from "@/lib/sizelistQuery";

const DOTUM = "돋움, Dotum, 'Nanum Gothic', sans-serif";
const GULIM = "굴림, Gulim, 'Nanum Gothic', sans-serif";
const PHONE = "031-863-0909";

/* 원본 getMoneyType(): 천단위 콤마 */
function money(n: number): string {
  return n.toLocaleString("ko-KR");
}

/* 수량 select 0~8 (원본 selordercnt1/2) */
const QTY_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

type Props = { tire: TireItem };

/**
 * 타이어 결과 카드 1개 (원본 사이즈 리스트의 900px 카드 테이블)
 *  - bestSection: 상단 "베스트 타이어" 주황 테두리(#c44b1c) 카드 (셀 폭/높이가 약간 다름)
 *  - 이미지/이름 클릭 → tireinfowin() 팝업, 수량 변경 → calcMoney() 총수량/총금액 갱신
 *  - 예약 버튼 → bookingSave() 검증/confirm 후 전화 안내 (원본 예약 페이지는 미구현)
 */
export default function TireCard({ tire }: Props) {
  const best = tire.bestSection;
  const [qty1, setQty1] = useState(tire.front.defaultQty);
  const [qty2, setQty2] = useState(tire.rear ? tire.rear.defaultQty : 0);
  const [hover, setHover] = useState(false);

  /* 원본 calcMoney(): 총수량 / 총금액(카드) / 최대할인(현금, 숨김) */
  const totalCnt = qty1 + (tire.rear ? qty2 : 0);
  const totalCard = tire.front.salePrice * qty1 + (tire.rear ? tire.rear.salePrice * qty2 : 0);
  const totalCash = tire.front.cashPrice * qty1 + (tire.rear ? tire.rear.cashPrice * qty2 : 0);

  function openInfo(e: React.MouseEvent) {
    e.preventDefault();
    openTireInfo(tire.tinfoseq);
  }

  /* 원본 bookingSave(fseq, rseq, inx) — 수량 검증 + confirm. 예약 입력 페이지 대신 전화 안내 */
  function bookingSave() {
    if (!tire.rear) {
      if (qty1 < 1) {
        alert("구매하실 수량을 선택하세요.");
        return;
      }
    } else if (qty1 < 1 && qty2 < 1) {
      alert("앞쪽 또는 뒤쪽타이어의 구매하실 수량을 선택하세요.");
      return;
    }
    if (confirm("구매수량을 확인 하셨나요?\n\n예약 하시겠습니까?")) {
      alert(`온라인 예약 접수는 준비 중입니다.\n예약 및 택배 문의는 전화 ${PHONE} 로 연락 주세요.`);
    }
  }

  /* 사이즈/속도등급/가격/수량 한 줄 (앞: frontRow, 뒤: rearRow — 원본 셀 폭이 2px 씩 다름) */
  const sizeRow = (b: SizeBlock, isRear: boolean, qty: number, setQty: (n: number) => void) => {
    const h = isRear ? 79 : 78;
    return (
      /* 모바일(.m-wrap): [사이즈 속도등급 가격] 한 줄, [할인율/수량] 은 다음 줄 전체 폭 */
      <table border={0} width={470} style={{ height: h }} cellSpacing={0} cellPadding={0} className="m-wrap">
        <tbody>
          <tr className="max-pc:gap-x-[8px] max-pc:py-[4px]">
            <td height={h} width={isRear ? 128 : 126} valign="middle" align="left">
              <b>
                <span style={{ fontFamily: "Tahoma", color: "#000", fontSize: "12pt" }}>{b.size}</span>
              </b>
            </td>
            <td height={h} width={isRear ? 44 : 46} valign="middle" align="left">
              <span style={{ fontFamily: "Arial", fontSize: "8pt" }}>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <u title={b.speedTitle}>{b.speedGrade}</u>
                </a>
              </span>
            </td>
            <td height={h} width={isRear ? 191 : 190} valign="middle" align="center" className="max-pc:ml-auto">
              <table border={0} width={isRear ? 166 : 164} style={{ height: 10 }} cellSpacing={0} cellPadding={0}>
                <tbody>
                  <tr>
                    <td height={22} align="right" valign="middle">
                      <span style={{ fontFamily: DOTUM, color: "#919191", fontSize: "9pt" }}>시중 : </span>
                      <span style={{ color: "#919191", fontFamily: "Verdana", fontSize: "10pt", textDecoration: "line-through" }}>
                        <b>{money(b.marketPrice)}</b>
                      </span>{" "}
                      <span style={{ fontFamily: GULIM, fontSize: "9pt", color: "#919191" }}>원</span>
                    </td>
                  </tr>
                  <tr>
                    <td height={22} align="right" valign="middle">
                      <span style={{ fontFamily: DOTUM, fontSize: "9pt", color: "#EA3A00" }}>할인</span>
                      <span style={{ fontSize: "9pt" }}> : </span>
                      <span style={{ color: "#CC3300", fontFamily: "Verdana", fontSize: "10pt" }}>
                        <b>{money(b.salePrice)}</b>
                      </span>
                      <span style={{ fontFamily: GULIM, fontSize: "9pt" }}> 원</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td height={h} width={isRear ? 107 : 108} align="center" className="max-pc:basis-full max-pc:pt-[4px]">
              {!isRear && (
                <>
                  <span style={{ color: "#FF0000", fontFamily: DOTUM, fontSize: 11 }}>{b.discountText}</span>
                  <br />
                  <br />
                </>
              )}
              <span style={{ fontSize: "8pt" }}>수량:</span>{" "}
              <select
                name={isRear ? "selordercnt2" : "selordercnt1"}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10))}
                style={{ fontFamily: "Arial", fontSize: "9pt", border: "1px solid #a9a9a9", background: "#fff" }}
              >
                {QTY_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>{" "}
              (개)
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  /* 앞뒤 사이즈가 다를 때 "Front Size (앞쪽타이어)" / "Rear Size (뒤쪽타이어)" 회색 헤더 */
  const frHeader = (en: string, ko: string, w: number) => (
    <table border={0} width={w} style={{ height: 3 }} cellSpacing={0} cellPadding={0} className="m-fluid">
      <tbody>
        <tr>
          <td height={15} width={w} style={{ backgroundColor: "#EAEAEA" }}>
            <span style={{ color: "#808080", fontSize: "8pt" }}>
              <span style={{ fontFamily: "Arial" }}><b>&nbsp;{en} </b></span>
              <span style={{ fontFamily: DOTUM }}>({ko})</span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const spacer = (w: number, h: number) => (
    <table border={0} width={w} style={{ height: h }} cellSpacing={0} cellPadding={0} className="m-fluid">
      <tbody>
        <tr>
          <td height={h} width={w}></td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <>
      {/* 모바일(.m-stack): [이미지] → [브랜드/설명/사이즈·가격·수량] → [총수량/총금액/예약] 세로 배치 */}
      <table border={0} width={900} style={{ height: 10 }} cellSpacing={0} cellPadding={0} className="m-stack">
        <tbody>
          <tr>
            <td height={10} width={900} align="center">
              {spacer(50, 10)}
              <table
                border={0}
                width={900}
                cellSpacing={0}
                cellPadding={0}
                style={best ? { height: 10, border: "1px solid #c44b1c" } : { height: 10 }}
                className="m-stack"
              >
                <tbody>
                  <tr>
                    {/* 좌: 제품 이미지 + 베스트 뱃지 */}
                    <td height="100%" width={best ? 209 : 210} align="left" valign="top">
                      <table border={0} width={194} style={{ height: 10 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                        <tbody>
                          <tr>
                            <td height={best ? 154 : 155} width={best ? 193 : 194} align="center" valign="top">
                              {best && spacer(50, 5)}
                              <a href="#" onClick={openInfo}>
                                <img src={tire.imageUrl} alt={`${tire.brand} ${tire.model}`} width={140} style={{ border: 0 }} />
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td height={25} width={194} align="center" valign={best ? "top" : undefined}>
                              {tire.isBest && (
                                <img src="/images/icon/besttextbox.gif" alt="베스트" width={63} height={21} style={{ border: 0 }} />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td height={5} width={194} align="center"></td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* 중: 브랜드/모델명, 설명, 점선, 사이즈·가격·수량 */}
                    <td height="100%" width={488} valign="top" align="center" className="max-pc:px-[8px]">
                      <table border={0} width={468} style={{ height: 5 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                        <tbody>
                          <tr>
                            <td height={best ? 40 : 30} width={468} valign="top" align="left">
                              {best && <div style={{ height: 10 }}></div>}
                              <a href="#" onClick={openInfo}>
                                <span style={{ fontSize: 16, color: "#000", fontWeight: 700 }}>{tire.brand}</span>{" "}
                                <span style={{ fontSize: 16, color: "#0066CC", fontWeight: 700 }}>{tire.model}</span>
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table border={0} width={468} style={{ height: 10 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                        <tbody>
                          <tr>
                            <td height={25} width={468} valign="top" align="left">
                              <span style={{ color: "#808080", fontFamily: DOTUM, fontSize: 11 }}>{tire.desc}</span>
                              {/* 원본 .tsizecomment-style (13px bold red) */}
                              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -1, color: "#ff0000", padding: "5px 0 0 0" }}>
                                {tire.comment}
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td height={10} width={468} valign="middle" align="left"></td>
                          </tr>
                        </tbody>
                      </table>
                      {/* 점선 (dotline.gif) */}
                      <table border={0} width={467} style={{ height: 3 }} cellSpacing={0} cellPadding={0} className="dotline m-fluid">
                        <tbody>
                          <tr>
                            <td height={10} width={467}></td>
                          </tr>
                        </tbody>
                      </table>
                      {/* 주장점 행 (있을 때만, 원본 td h30 8pt 돋움 회색 + 굵은 글씨) + 7px 여백 */}
                      <table border={0} width={468} style={{ height: 10 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                        <tbody>
                          {tire.strength && (
                            <tr>
                              <td height={30} width={468} align="left">
                                <span style={{ fontFamily: DOTUM, fontSize: "8pt", color: "#808080" }}>주장점: </span>
                                <span style={{ color: "#808080" }}><b>{tire.strength}</b></span>
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td height={7} width={468}></td>
                          </tr>
                        </tbody>
                      </table>

                      {tire.rear && frHeader("Front Size", "앞쪽타이어", 468)}
                      {sizeRow(tire.front, false, qty1, setQty1)}
                      {tire.rear && (
                        <>
                          {frHeader("Rear Size", "뒤쪽타이어", 470)}
                          {sizeRow(tire.rear, true, qty2, setQty2)}
                          {spacer(430, 6)}
                        </>
                      )}
                      {/* 여백 */}
                      {spacer(100, 5)}
                    </td>

                    {/* 우: 총수량/총금액/예약 버튼 (회색 배경) */}
                    <td height="100%" width={best ? 204 : 202} valign="top" align="center" style={{ backgroundColor: "#F7F7F7" }}>
                      {spacer(50, 10)}
                      <table border={0} width={183} style={{ height: 196 }} cellSpacing={0} cellPadding={0} className="m-fluid">
                        <tbody>
                          <tr>
                            <td height={28} width={183} valign="bottom" align="left">
                              &nbsp;&nbsp;총수량:{" "}
                              <span style={{ color: "#000", fontSize: "14pt" }}>
                                <b>{totalCnt}</b>
                              </span>{" "}
                              개
                            </td>
                          </tr>
                          <tr>
                            <td height={36} width={183} valign="middle" align="left">
                              &nbsp;&nbsp;총금액:{" "}
                              <span style={{ color: "#CC3300", fontFamily: "Verdana", fontSize: "11pt" }}>
                                <b>{money(totalCard)}</b>
                              </span>{" "}
                              원
                            </td>
                          </tr>
                          {/* 원본에서 display:none 인 최대(현금) 금액 행 */}
                          <tr style={{ display: "none" }}>
                            <td height={20} width={183} valign="top" align="left">
                              <span style={{ fontSize: "9pt", color: "#008080" }}>
                                &nbsp;&nbsp; → 최대: <span style={{ fontFamily: "Verdana" }}>{money(totalCash)}</span> 원
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td height={87} width={183} valign="middle" align="center">
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  bookingSave();
                                }}
                              >
                                {/* 원본 overimg(): hover 시 bookingbut_over.gif */}
                                <img
                                  src={hover ? "/images/button/bookingbut_over.gif" : "/images/button/bookingbut.gif"}
                                  alt="예약하기"
                                  width={156}
                                  height={61}
                                  style={{ border: 0 }}
                                  onMouseOver={() => setHover(true)}
                                  onMouseOut={() => setHover(false)}
                                />
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td height={25} width={183} valign="middle" align="center">
                              <b>
                                <span style={{ fontFamily: DOTUM, color: "#FF0000" }}>택배는 전화주세요!!</span>
                              </b>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {spacer(50, best ? 13 : 10)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      {/* 카드 구분선 (aibtbar.gif 배경) + 10px 여백 */}
      <table
        border={0}
        width={best ? 898 : 900}
        cellSpacing={0}
        cellPadding={0}
        style={{ height: best ? 10 : 3, background: "url(/images/main/aibtbar.gif)" }}
        className="m-fluid"
      >
        <tbody>
          <tr>
            <td height={10} width={best ? 898 : 900}></td>
          </tr>
        </tbody>
      </table>
      {spacer(50, 10)}
    </>
  );
}
