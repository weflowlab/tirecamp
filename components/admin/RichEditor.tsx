"use client";

import { useEffect, useRef } from "react";
import { BTN_TEXT } from "./ui";

/**
 * 보이는 대로 편집하는 간단한 본문 편집기 (공지사항용)
 * - 관리자는 HTML 을 보지 않는다. 글을 치고 Enter 로 줄을 바꾸고, [굵게]·[이미지 넣기] 만 쓴다.
 * - 저장값은 편집 영역의 HTML (기존 공지 데이터 형식과 같음). 붙여넣기는 서식 없는 글자만 받는다.
 * - 라이브러리 없이 contentEditable + execCommand 로 구현 (모든 브라우저에서 동작)
 */
export default function RichEditor({
  value,
  onChange,
  onPickImage,
  busy,
  minHeight = 360,
}: {
  value: string;
  onChange: (html: string) => void;
  /** 이미지 넣기 버튼 → 파일 선택 → 업로드된 URL 을 돌려주면 커서 위치에 삽입 */
  onPickImage: () => Promise<string | null>;
  busy?: boolean;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  /* 바깥에서 값이 바뀌었을 때만 편집 영역에 반영 (타이핑 중 커서가 튀지 않도록 같은 값이면 건드리지 않음) */
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (el) onChange(el.innerHTML);
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  async function insertImage() {
    const url = await onPickImage();
    if (!url) return;
    ref.current?.focus();
    document.execCommand("insertHTML", false, `<img src="${url}" alt="" style="max-width:100%"><br>`);
    emit();
  }

  return (
    <div className="border border-line bg-white focus-within:border-ink">
      {/* 도구 줄 */}
      <div className="flex items-center gap-[14px] border-b border-line px-[12px] py-[8px]">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} className="h-[26px] w-[26px] border border-line text-[13px] font-bold text-ink hover:bg-surface" title="굵게">
          B
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")} className="h-[26px] w-[26px] border border-line text-[13px] text-ink underline hover:bg-surface" title="밑줄">
          U
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertHorizontalRule")} className="h-[26px] border border-line px-[8px] text-[12px] text-ink hover:bg-surface" title="구분선">
          구분선
        </button>
        <button type="button" disabled={busy} onMouseDown={(e) => e.preventDefault()} onClick={insertImage} className={`${BTN_TEXT} ml-auto`}>
          이미지 넣기
        </button>
      </div>
      {/* 편집 영역 */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          // 워드/웹에서 복사한 서식은 버리고 글자만 붙인다 (줄바꿈은 유지)
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        data-placeholder="내용을 입력하세요. Enter 로 줄을 바꿉니다."
        className="rich-editor px-[16px] py-[14px] text-[14px] leading-[26px] text-graphite outline-none [&_img]:my-[8px] [&_img]:block [&_img]:max-w-full [&_p]:min-h-[26px] [&_hr]:my-[14px] [&_hr]:border-line [&_b]:text-ink [&_strong]:text-ink"
        style={{ minHeight }}
      />
    </div>
  );
}
