"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Faq } from "@/lib/faq";
import { BTN, BTN_DANGER, BTN_OUTLINE, BTN_TEXT, Empty, FIELD, Msg, TEXTAREA } from "./ui";

/* 순서 변경 동그라미 버튼 */
const ARROW = "flex h-[28px] w-[28px] items-center justify-center rounded-full border border-line bg-white text-graphite transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30";

/**
 * FAQ 편집 (클라이언트) — 목록 전체를 상태로 들고 있다가 PUT /api/admin/faq 로 한 번에 저장
 * - 항목 클릭 → 펼쳐서 질문/답변 수정, ↑↓ 로 순서 변경
 */
export default function FaqManager({ initial }: { initial: Faq[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Faq[]>(initial);
  const [open, setOpen] = useState<number>(-1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  /* 마지막으로 저장된 상태 — 저장 후 "변경 있음" 표시가 사라지도록 저장 시점에 갱신 */
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(items) !== saved;

  /* 내용을 건드리면 이전 저장/오류 문구는 지운다 */
  const update = (i: number, patch: Partial<Faq>) => {
    setMsg(null);
    setItems((list) => list.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  };
  const move = (i: number, dir: -1 | 1) =>
    setItems((list) => {
      setMsg(null);
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = list.slice();
      [next[i], next[j]] = [next[j], next[i]];
      setOpen(j);
      return next;
    });
  const remove = (i: number) => {
    if (!confirm("이 질문을 삭제할까요?")) return;
    setMsg(null);
    setItems((list) => list.filter((_, idx) => idx !== i));
    setOpen(-1);
  };
  /* 취소: 마지막으로 저장된 상태로 되돌린다 */
  const cancel = () => {
    if (!dirty) return;
    if (!confirm("저장하지 않은 변경을 모두 되돌릴까요?")) return;
    setItems(JSON.parse(saved) as Faq[]);
    setOpen(-1);
    setMsg(null);
  };
  /* 질문 추가 → 새 항목(맨 아래)을 펼치고 그 위치로 부드럽게 스크롤 + 질문 입력칸에 포커스 */
  const listRef = useRef<HTMLUListElement>(null);
  const scrollToRef = useRef<number | null>(null);
  const add = () => {
    setMsg(null);
    setItems((list) => [...list, { q: "", a: "" }]);
    setOpen(items.length);
    scrollToRef.current = items.length;
  };
  useEffect(() => {
    const idx = scrollToRef.current;
    if (idx == null) return;
    scrollToRef.current = null;
    const li = listRef.current?.children[idx] as HTMLElement | undefined;
    if (!li) return;
    li.scrollIntoView({ behavior: "smooth", block: "start" });
    const input = li.querySelector<HTMLInputElement>("input");
    // 스크롤이 끝난 뒤 포커스 (즉시 포커스하면 브라우저가 부드러운 스크롤을 건너뛴다)
    const t = setTimeout(() => input?.focus({ preventScroll: true }), 450);
    return () => clearTimeout(t);
  }, [items.length]);

  async function save() {
    for (const [i, f] of items.entries()) {
      if (!f.q.trim() || !f.a.trim()) {
        setOpen(i);
        return setMsg({ ok: false, text: `${i + 1}번 항목의 질문과 답변을 모두 입력해 주세요.` });
      }
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/faq", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setSaved(JSON.stringify(items));
      setOpen(-1); // 펼쳐 둔 항목을 접어 저장이 끝났음을 보여준다
      setMsg({ ok: true, text: "저장했습니다. 사이트에 바로 반영됩니다." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* 모바일에서는 개수 문구와 버튼 줄을 위아래로 나눠 글자가 꺾이지 않게 */}
      <div className="mb-[14px] flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch max-pc:gap-[10px]">
        <p className="text-[12px] text-muted">
          총 <span style={{ fontFamily: "var(--font-num)" }}>{items.length}</span>개{dirty && <span className="ml-[8px] text-ink">· 저장하지 않은 변경이 있습니다</span>}
        </p>
        <div className="flex shrink-0 gap-[6px] whitespace-nowrap max-pc:justify-end">
          <button type="button" className={`${BTN_OUTLINE} shrink-0`} onClick={add}>
            + 질문 추가
          </button>
          {dirty && (
            <button type="button" disabled={busy} className={`${BTN_OUTLINE} shrink-0`} onClick={cancel}>
              취소
            </button>
          )}
          <button type="button" disabled={busy || !dirty} className={`${BTN} shrink-0`} onClick={save}>
            {busy ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty>등록된 질문이 없습니다. [질문 추가] 로 시작하세요.</Empty>
      ) : (
        <ul ref={listRef} className="border-t border-ink bg-white">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className="scroll-mt-[72px] border-b border-line">
                <div className={`flex items-center gap-[14px] px-[18px] py-[14px] max-pc:px-[12px] ${isOpen ? "bg-surface" : "hover:bg-surface"}`}>
                  <span className="eyebrow w-[24px] shrink-0 !text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <button type="button" className="min-w-0 flex-1 truncate text-left text-[14px] font-medium text-ink" onClick={() => setOpen(isOpen ? -1 : i)}>
                    {f.q || <span className="text-faint">(질문을 입력하세요)</span>}
                  </button>
                  <div className="flex shrink-0 items-center gap-[10px]">
                    <button type="button" className={ARROW} disabled={i === 0} onClick={() => move(i, -1)} aria-label="위로" title="위로">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    </button>
                    <button type="button" className={ARROW} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="아래로" title="아래로">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    </button>
                    <button type="button" className={BTN_TEXT} onClick={() => setOpen(isOpen ? -1 : i)}>
                      {isOpen ? "접기" : "수정"}
                    </button>
                    <button type="button" className={BTN_DANGER} onClick={() => remove(i)}>
                      삭제
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-line bg-surface px-[18px] py-[16px] pl-[56px] max-pc:px-[12px]">
                    <label className="block">
                      <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">질문</span>
                      <input className={FIELD} value={f.q} maxLength={200} onChange={(e) => update(i, { q: e.target.value })} />
                    </label>
                    <label className="mt-[12px] block">
                      <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">답변</span>
                      <textarea className={`${TEXTAREA} h-[120px]`} value={f.a} maxLength={2000} onChange={(e) => update(i, { a: e.target.value })} />
                    </label>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-[14px] flex items-center justify-end gap-[12px] whitespace-nowrap">
        <Msg msg={msg} />
        {dirty && (
          <button type="button" disabled={busy} className={`${BTN_OUTLINE} shrink-0`} onClick={cancel}>
            취소
          </button>
        )}
        <button type="button" disabled={busy || !dirty} className={`${BTN} shrink-0`} onClick={save}>
          {busy ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
