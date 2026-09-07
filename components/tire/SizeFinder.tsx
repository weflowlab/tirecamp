"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INCHES, RATIOS, WIDTHS } from "@/lib/tireSizeOptions";
import TireSizeHelpDialog from "@/components/tire/TireSizeHelpDialog";


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
      {/* [타이틀 212px | select 줄(+뒤 사이즈 줄) + 체크박스 | 검색 버튼 | 사이즈 보는 방법] — 모바일은 세로 */}
      <div className="flex items-start font-sans max-pc:flex-col">
        <div className="w-[212px] shrink-0 pt-[4px] max-pc:mb-[10px] max-pc:w-auto">
          <p className="eyebrow">By Size</p>
          <p className="mt-[2px] text-[15px] font-semibold tracking-[-0.01em] text-ink">타이어사이즈로 검색</p>
        </div>

        <div className="min-w-0 flex-1">
          {/* 1줄: 앞(또는 전체) 사이즈 + 검색 버튼 + 보는 방법 (모두 38px 높이로 정렬) */}
          <div className="flex flex-wrap items-center gap-[8px]">
            {frchk && <span className="eyebrow w-[44px] !text-faint max-pc:w-full">Front</span>}
            <SizeSelects idx={1} value={front} onChange={setFront} />
            <button type="button" onClick={findSize} className="btn-fill ml-[6px] !h-[38px] w-[130px] !px-0 max-pc:ml-0 max-pc:w-full">
              타이어 찾기
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="ml-[6px] inline-flex h-[38px] items-center gap-[6px] border border-line px-[14px] text-[12px] text-graphite transition-colors hover:border-ink hover:text-ink max-pc:ml-0 max-pc:w-full max-pc:justify-center"
            >
              <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full border border-current text-[10px] font-bold leading-none">?</span>
              사이즈 보는 방법
            </button>
          </div>
          {/* 2줄: 뒤 사이즈 (체크 시에만) */}
          {frchk && (
            <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
              <span className="eyebrow w-[44px] !text-faint max-pc:w-full">Rear</span>
              <SizeSelects idx={2} value={rear} onChange={setRear} />
            </div>
          )}
          {/* 3줄: 앞뒤 사이즈가 다른 경우 */}
          <label className="mt-[8px] flex cursor-pointer items-center gap-[6px] text-[12px] text-graphite">
            <input type="checkbox" name="frchk" value="2" checked={frchk} onChange={(e) => onFrchk(e.target.checked)} className="accent-black" />
            앞뒤 사이즈가 다른 경우
          </label>
        </div>
      </div>

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
        className="field !h-[38px] !px-[8px] !text-[13px] !w-auto"
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
        className="field !h-[38px] !px-[8px] !text-[13px] !w-auto"
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
        className="field !h-[38px] !px-[8px] !text-[13px] !w-auto"
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
