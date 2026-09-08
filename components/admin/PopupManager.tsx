"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { POPUP_STATE_LABEL, popupState, type Popup } from "@/lib/popups";
import { Badge, BTN, BTN_DANGER, BTN_OUTLINE, BTN_TEXT, Card, Empty, FIELD, Field, Msg, NUM } from "./ui";

type Draft = Pick<Popup, "title" | "start" | "end" | "linkUrl" | "newWindow" | "hideToday" | "pcImage" | "mobImage" | "enabled" | "scope">;

/** 이미지 선택/미리보기 한 칸 (모듈 레벨 컴포넌트 — 렌더 중 생성하면 매번 리마운트됨) */
function ImagePick({
  label,
  required,
  value,
  inputRef,
  hint,
  busy,
  onClear,
  onFile,
}: {
  label: string;
  required?: boolean;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  hint: string;
  busy: boolean;
  onClear: () => void;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">
        {label}
        {required && <span className="ml-[2px] text-ink">*</span>}
        <span className="ml-[6px] text-faint">{hint}</span>
      </span>
      {value ? (
        <div className="flex items-start gap-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-[140px] max-w-[220px] border border-line object-contain" />
          <div className="flex flex-col gap-[6px]">
            <button type="button" disabled={busy} className={BTN_TEXT} onClick={() => inputRef.current?.click()}>
              바꾸기
            </button>
            <button type="button" className={BTN_TEXT} onClick={onClear}>
              제거
            </button>
          </div>
        </div>
      ) : (
        <button type="button" disabled={busy} className={BTN_OUTLINE} onClick={() => inputRef.current?.click()}>
          이미지 선택
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}

function emptyDraft(today: string): Draft {
  return { title: "", start: today, end: today, linkUrl: "", newWindow: false, hideToday: true, pcImage: "", mobImage: "", enabled: true, scope: "home" };
}

/**
 * 팝업 등록/수정 폼 + 목록 (클라이언트)
 * - 이미지는 선택 즉시 /api/admin/upload?dir=popup 로 올리고 경로만 폼에 담는다
 */
export default function PopupManager({ popups, today }: { popups: Popup[]; today: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Popup | null>(null);
  const [formOpen, setFormOpen] = useState(popups.length === 0);
  const [draft, setDraft] = useState<Draft>(emptyDraft(today));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pcRef = useRef<HTMLInputElement>(null);
  const mobRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Draft, v: string | boolean) => setDraft((d) => ({ ...d, [k]: v }));

  function startNew() {
    setEditing(null);
    setDraft(emptyDraft(today));
    setFormOpen(true);
    setMsg(null);
  }
  function startEdit(p: Popup) {
    setEditing(p);
    setDraft({ title: p.title, start: p.start, end: p.end, linkUrl: p.linkUrl, newWindow: p.newWindow, hideToday: p.hideToday, pcImage: p.pcImage, mobImage: p.mobImage, enabled: p.enabled, scope: p.scope });
    setFormOpen(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>, key: "pcImage" | "mobImage") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload?dir=popup", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "업로드에 실패했습니다.");
      set(key, data.url);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "업로드에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(editing ? `/api/admin/popups/${editing.id}` : "/api/admin/popups", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "저장에 실패했습니다.");
      setEditing(null);
      setDraft(emptyDraft(today));
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "저장에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  async function toggle(p: Popup) {
    await fetch(`/api/admin/popups/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !p.enabled }) }).catch(() => {});
    router.refresh();
  }

  async function remove(p: Popup) {
    if (!confirm(`"${p.title}" 팝업을 삭제할까요?`)) return;
    await fetch(`/api/admin/popups/${p.id}`, { method: "DELETE" }).catch(() => {});
    if (editing?.id === p.id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-[16px]">
      {formOpen ? (
        <form onSubmit={submit}>
          <Card
            eyebrow={editing ? "Edit" : "New"}
            title={editing ? `팝업 수정 — ${editing.title}` : "새 팝업 등록"}
            action={
              <button type="button" className={BTN_TEXT} onClick={() => setFormOpen(false)}>
                닫기
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-[12px] max-pc:grid-cols-1">
              <Field label="팝업 제목" required hint="(관리용, 화면에는 안 보임)">
                <input className={FIELD} value={draft.title} maxLength={60} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-[8px]">
                <Field label="시작일" required>
                  <input type="date" className={FIELD} value={draft.start} onChange={(e) => set("start", e.target.value)} />
                </Field>
                <Field label="종료일" required>
                  <input type="date" className={FIELD} value={draft.end} onChange={(e) => set("end", e.target.value)} />
                </Field>
              </div>
              <Field label="클릭 시 이동 URL" hint="(선택)">
                <input className={FIELD} value={draft.linkUrl} maxLength={300} placeholder="/contact 또는 https://..." onChange={(e) => set("linkUrl", e.target.value)} />
              </Field>
              <Field label="노출 위치">
                <select className={FIELD} value={draft.scope} onChange={(e) => set("scope", e.target.value)}>
                  <option value="home">홈에서만</option>
                  <option value="all">모든 페이지</option>
                </select>
              </Field>
            </div>
            <div className="mt-[14px] flex flex-wrap gap-[20px] text-[13px] text-ink">
              <label className="flex cursor-pointer items-center gap-[8px]">
                <input type="checkbox" className="accent-black" checked={draft.newWindow} onChange={(e) => set("newWindow", e.target.checked)} />
                링크를 새 창으로 열기
              </label>
              <label className="flex cursor-pointer items-center gap-[8px]">
                <input type="checkbox" className="accent-black" checked={draft.hideToday} onChange={(e) => set("hideToday", e.target.checked)} />
                [오늘 하루 열지 않기] 버튼 표시
              </label>
              <label className="flex cursor-pointer items-center gap-[8px]">
                <input type="checkbox" className="accent-black" checked={draft.enabled} onChange={(e) => set("enabled", e.target.checked)} />
                사용 (끄면 기간과 상관없이 노출 안 함)
              </label>
            </div>
            <div className="mt-[18px] grid grid-cols-2 gap-[12px] border-t border-line pt-[18px] max-pc:grid-cols-1">
              <ImagePick label="PC 이미지" required value={draft.pcImage} inputRef={pcRef} hint="가로 640px 안팎 권장" busy={busy} onClear={() => set("pcImage", "")} onFile={(e) => upload(e, "pcImage")} />
              <ImagePick label="모바일 이미지" value={draft.mobImage} inputRef={mobRef} hint="(선택, 없으면 PC 이미지 사용)" busy={busy} onClear={() => set("mobImage", "")} onFile={(e) => upload(e, "mobImage")} />
            </div>
            <div className="mt-[18px] flex items-center justify-between gap-[10px]">
              <Msg msg={msg} />
              <div className="ml-auto flex gap-[6px]">
                {editing && (
                  <button type="button" className={BTN_OUTLINE} onClick={startNew}>
                    새로 등록
                  </button>
                )}
                <button type="submit" disabled={busy} className={BTN}>
                  {busy ? "저장 중..." : editing ? "수정 저장" : "등록"}
                </button>
              </div>
            </div>
          </Card>
        </form>
      ) : (
        <div className="flex justify-end">
          <button type="button" className={BTN} onClick={startNew}>
            + 팝업 등록
          </button>
        </div>
      )}

      {popups.length === 0 ? (
        <Empty>등록된 팝업이 없습니다.</Empty>
      ) : (
        <ul className="grid grid-cols-2 gap-[12px] max-pc:grid-cols-1">
          {popups.map((p) => {
            const state = popupState(p, today);
            return (
              <li key={p.id} className={`flex gap-[16px] border bg-white p-[16px] ${state === "active" ? "border-ink" : "border-line"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.pcImage} alt="" className="h-[96px] w-[128px] shrink-0 border border-line bg-surface object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[8px]">
                    <Badge tone={state === "active" ? "ink" : state === "waiting" ? "outline" : "faint"}>{POPUP_STATE_LABEL[state]}</Badge>
                    <span className="text-[11px] text-faint">{p.scope === "all" ? "모든 페이지" : "홈"}</span>
                  </div>
                  <p className="mt-[6px] truncate text-[14px] font-semibold text-ink">{p.title}</p>
                  <p className="mt-[3px] text-[12px] text-muted" style={NUM}>
                    {p.start.replace(/-/g, ".")} ~ {p.end.replace(/-/g, ".")}
                  </p>
                  {p.linkUrl && <p className="mt-[2px] truncate text-[11px] text-faint">{p.linkUrl}</p>}
                  <div className="mt-[10px] flex gap-[12px]">
                    <button type="button" className={BTN_TEXT} onClick={() => startEdit(p)}>
                      수정
                    </button>
                    <button type="button" className={BTN_TEXT} onClick={() => toggle(p)}>
                      {p.enabled ? "끄기" : "켜기"}
                    </button>
                    <button type="button" className={BTN_DANGER} onClick={() => remove(p)}>
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
