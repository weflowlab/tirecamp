"use client";

import { useRef, type FormEvent } from "react";

/* 원본 comfuc.js Check_Num: 빈 값이거나 숫자(또는 '-'로 시작)면 true */
function Check_Num(data: string): boolean {
  if (data.length === 0) return true;
  return /(^-)|(^\d+$)/.test(data);
}

const INPUT_STYLE = { fontFamily: "Tahoma, sans-serif", fontSize: "11pt", border: "1px solid #DFDFDF" } as const;

/**
 * 타이어 예약확인 입력 폼 (원본 custchk.aspx <form name=frm>)
 * - savedata(): 통신사/핸드폰/성함 검증 alert (원본 문구 그대로)
 * - moveTelNum / hp1_onkeyup / hp2_onkeyup: 4자리 입력 시 다음 칸으로 포커스 이동
 * - 원본은 자기 자신에게 POST 후 예약 DB 조회 → 결과 없으면 alert("예약정보가 없습니다.") 와 빈 폼을 다시 표시
 *   (예약 DB 가 없으므로 검증 통과 시 동일한 alert 후 폼을 초기화)
 */
export default function BookingCheckForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const seltelcomRef = useRef<HTMLSelectElement>(null);
  const hp1Ref = useRef<HTMLInputElement>(null);
  const hp2Ref = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  /* 원본 savedata() */
  function savedata(): boolean {
    const seltelcom = seltelcomRef.current!;
    const hp1 = hp1Ref.current!;
    const hp2 = hp2Ref.current!;
    const customerName = nameRef.current!;

    if (seltelcom.selectedIndex < 1) {
      alert("핸드폰번호를 입력하세요.");
      seltelcom.focus();
      return false;
    }
    if (hp1.value === "") {
      alert("핸드폰번호를 입력하세요.");
      hp1.focus();
      return false;
    }
    if (!Check_Num(hp1.value)) {
      alert("핸드폰번호는 숫자만 입력 가능 합니다.");
      hp1.focus();
      return false;
    }
    if (hp2.value === "") {
      alert("핸드폰번호를 입력하세요.");
      hp2.focus();
      return false;
    }
    if (!Check_Num(hp2.value)) {
      alert("핸드폰번호는 숫자만 입력 가능 합니다.");
      hp2.focus();
      return false;
    }
    if (customerName.value === "") {
      alert("고객님의 성함을 입력하세요.");
      customerName.focus();
      return false;
    }
    return true;
  }

  /* 폼 제출: 검증 후 (예약 DB 없음) 원본 "결과 없음" 응답과 동일하게 처리 */
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!savedata()) return;
    alert("예약정보가 없습니다.");
    formRef.current?.reset();
  }

  /* 원본 moveTelNum(): 통신사 선택 시 hp1 로 포커스 */
  function moveTelNum() {
    if ((seltelcomRef.current?.selectedIndex ?? 0) > 0) hp1Ref.current?.focus();
  }
  /* 원본 hp1_onkeyup(): 4자리 입력 시 hp2 로 포커스 */
  function hp1_onkeyup() {
    if (hp1Ref.current?.value.length === 4) hp2Ref.current?.focus();
  }
  /* 원본 hp2_onkeyup(): 4자리 입력 시 성함 칸으로 포커스 */
  function hp2_onkeyup() {
    if (hp2Ref.current?.value.length === 4) nameRef.current?.focus();
  }

  return (
    <form ref={formRef} name="frm" method="post" onSubmit={onSubmit}>
      <table style={{ width: 632, height: 333, border: "2px solid #E3E3E3" }}>
        <tbody>
          <tr>
            <td style={{ height: 329, width: 626, textAlign: "center" }}>
              <div className="inline-block">
                {/* 안내 문구 */}
                <table style={{ width: 453, height: 32 }}>
                  <tbody>
                    <tr>
                      <td style={{ height: 32, width: 453, verticalAlign: "top", textAlign: "left" }}>▼ 예약시 입력한 핸드폰과 성함을 입력하세요</td>
                    </tr>
                  </tbody>
                </table>

                {/* 입력 박스 (3px #EFEFEF 테두리) */}
                <table style={{ width: 451, height: 134, border: "3px solid #EFEFEF" }}>
                  <tbody>
                    <tr>
                      <td style={{ height: 48, width: 140, textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: "#000000" }}>핸드폰번호</span>
                      </td>
                      <td style={{ height: 48, width: 311, textAlign: "left" }}>
                        <select
                          ref={seltelcomRef}
                          name="seltelcom"
                          size={1}
                          defaultValue="NO"
                          onChange={moveTelNum}
                          style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11pt" }}
                        >
                          <option value="NO">선택</option>
                          <option value="010">010</option>
                          <option value="011">011</option>
                          <option value="016">016</option>
                          <option value="017">017</option>
                          <option value="018">018</option>
                          <option value="019">019</option>
                        </select>{" "}
                        -{" "}
                        <input ref={hp1Ref} type="text" name="hp1" size={4} maxLength={4} onKeyUp={hp1_onkeyup} style={INPUT_STYLE} /> -{" "}
                        <input ref={hp2Ref} type="text" name="hp2" size={4} maxLength={4} onKeyUp={hp2_onkeyup} style={INPUT_STYLE} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ height: 34, width: 140, textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: "#000000" }}>예약자성함</span>
                      </td>
                      <td style={{ height: 34, width: 311, textAlign: "left" }}>
                        <input
                          ref={nameRef}
                          type="text"
                          name="customerName"
                          size={16}
                          maxLength={4}
                          style={{ fontFamily: "돋움, 'Nanum Gothic', sans-serif", fontSize: "11pt", border: "1px solid #DFDFDF", fontWeight: "bold" }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ height: 52, width: 140 }} />
                      <td style={{ height: 52, width: 311, textAlign: "left" }}>
                        <input
                          tabIndex={-1}
                          type="image"
                          name="imageField0"
                          src="/images/button/bookingviewbut.gif"
                          width={104}
                          height={27}
                          alt="예약확인"
                          className="inline align-middle"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ width: 453, height: 30 }} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
}
