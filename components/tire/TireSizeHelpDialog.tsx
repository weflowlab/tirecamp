"use client";

import { useEffect } from "react";

/**
 * "타이어사이즈 확인방법" 모달 (원본 #pdspop_tiresize jQuery UI dialog, width 620, modal)
 * - 타이틀바 + 본문(600x430, 배경 /images/popup/tiresizetxt.gif) + 닫기 버튼
 * - 오버레이 클릭 / ESC / 닫기 버튼으로 닫힘 (jQuery 없이 직접 구현)
 */
export default function TireSizeHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  /* ESC 키로 닫기 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* 오버레이 (jQuery UI .ui-widget-overlay 와 비슷한 반투명) */}
      <div className="fixed inset-0 z-[1000] bg-[#aaaaaa]/30" onClick={onClose} />

      {/* 다이얼로그 본체 (620px) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="타이어사이즈 확인방법"
        className="fixed left-1/2 top-1/2 z-[1001] w-[620px] -translate-x-1/2 -translate-y-1/2 bg-white border border-[#aaaaaa] rounded-[4px] p-[2px] shadow-[0_2px_12px_rgba(0,0,0,0.3)] max-pc:w-[calc(100%-20px)]"
      >
        {/* 타이틀바 (jQuery UI .ui-dialog-titlebar) */}
        <div className="relative h-[34px] leading-[34px] px-[10px] bg-[#e9e9e9] border border-[#dddddd] rounded-[3px] font-bold text-[11pt] text-[#333333]">
          타이어사이즈 확인방법
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            className="absolute right-[6px] top-[7px] w-[20px] h-[20px] leading-[18px] text-center text-[#666666] border border-[#cccccc] rounded-[3px] bg-white hover:bg-[#f5f5f5] cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* 본문: 원본 600x430 테이블 + 배경 이미지(600x434 gif).
            모바일에서는 폭에 맞춰 같은 비율(600:430)로 축소되도록 aspect-ratio 박스 + background-size 100% */}
        <div className="flex justify-center py-[8px]">
          <div
            className="w-[600px] h-[430px] max-pc:w-full max-pc:h-auto max-pc:aspect-[600/430]"
            style={{
              backgroundImage: "url(/images/popup/tiresizetxt.gif)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% auto",
            }}
          />
        </div>

        {/* 버튼 영역 (jQuery UI .ui-dialog-buttonpane): 닫기 */}
        <div className="flex justify-end border-t border-[#dddddd] px-[10px] py-[8px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[14px] h-[28px] text-[9pt] text-[#333333] bg-[#f6f6f6] border border-[#cccccc] rounded-[3px] hover:bg-[#e9e9e9] cursor-pointer"
            style={{ fontFamily: "굴림, 'Nanum Gothic', sans-serif" }}
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
}
