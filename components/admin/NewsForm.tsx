"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { NewsItem } from "@/lib/newsTypes";
import RichEditor from "./RichEditor";
import { BTN, BTN_OUTLINE, BTN_TEXT, Card, FIELD, Field, Msg } from "./ui";

/**
 * 공지 작성/수정 폼 (클라이언트)
 * - 본문은 보이는 대로 편집(RichEditor). 관리자는 HTML 을 보지 않고, 저장값은 편집기의 HTML 이다.
 * - 이미지 업로드 → /api/admin/upload?dir=news → 본문 커서 위치에 삽입
 */
export default function NewsForm({ item }: { item: NewsItem | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [date, setDate] = useState((item?.date ?? "").replace(/\./g, "-"));
  const [notice, setNotice] = useState(item?.notice ?? false);
  const [thumb, setThumb] = useState(item?.thumb ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  async function upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload?dir=news", { method: "POST", body: fd });
    const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
    if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "업로드에 실패했습니다.");
    return data.url;
  }

  /** 편집기의 [이미지 넣기] → 파일 선택창 → 업로드 → URL (취소하면 null) */
  function pickImage(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        setBusy(true);
        try {
          resolve(await upload(file));
        } catch (err) {
          setMsg({ ok: false, text: err instanceof Error ? err.message : "업로드에 실패했습니다." });
          resolve(null);
        } finally {
          setBusy(false);
        }
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  async function uploadThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      setThumb(await upload(file));
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "업로드에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setMsg({ ok: false, text: "제목을 입력해 주세요." });
    if (!content.replace(/<[^>]+>|&nbsp;/g, "").trim() && !/<img/i.test(content)) return setMsg({ ok: false, text: "내용을 입력해 주세요." });
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(item ? `/api/admin/news/${item.seq}` : "/api/admin/news", {
        method: item ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, notice, thumb, summary: item?.summary ?? "", content }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "저장에 실패했습니다.");
      router.push("/admin/news");
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "저장에 실패했습니다." });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-[1fr_300px] gap-[16px] max-pc:grid-cols-1">
      <Card>
        <Field label="제목" required>
          <input className={`${FIELD} !h-[44px] !text-[15px] font-medium`} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="mt-[16px]">
          <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">
            내용<span className="ml-[2px] text-ink">*</span>
            <span className="ml-[6px] text-faint">보이는 그대로 저장됩니다. Enter 로 줄바꿈, 사진은 [이미지 넣기]</span>
          </span>
          <RichEditor value={content} onChange={setContent} onPickImage={pickImage} busy={busy} />
        </div>
      </Card>

      {/* 우측(게시 설정 + 저장 버튼)은 스크롤해도 따라 내려온다 (PC) */}
      <div className="flex flex-col gap-[16px] pc:sticky pc:top-[24px] pc:self-start">
        <Card eyebrow="Options" title="게시 설정">
          <label className="flex cursor-pointer items-center gap-[8px] text-[13px] text-ink">
            <input type="checkbox" checked={notice} onChange={(e) => setNotice(e.target.checked)} className="accent-black" />
            공지로 표시 (목록에 Notice 라벨)
          </label>
          <div className="mt-[14px]">
            <Field label="작성일" hint="(비우면 오늘)">
              <input type="date" className={FIELD} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>
          <div className="mt-[14px]">
            <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">
              썸네일 <span className="text-faint">(선택)</span>
              <span className="mt-[2px] block text-[11px] text-faint">가로·세로 상관없이 목록 왼쪽에 맞춰 보입니다</span>
            </span>
            {thumb ? (
              <div className="flex items-start gap-[10px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt="" className="h-[100px] w-[150px] border border-line object-cover" />
                <button type="button" className={BTN_TEXT} onClick={() => setThumb("")}>
                  제거
                </button>
              </div>
            ) : (
              <button type="button" disabled={busy} className={BTN_OUTLINE} onClick={() => thumbRef.current?.click()}>
                이미지 선택
              </button>
            )}
            <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={uploadThumb} />
          </div>
        </Card>

        <div className="flex flex-col gap-[8px]">
          <button type="submit" disabled={busy} className={`${BTN} w-full !h-[44px] !text-[13px]`}>
            {busy ? "저장 중..." : item ? "수정 저장" : "등록"}
          </button>
          <Link href="/admin/news" className={`${BTN_OUTLINE} w-full !h-[44px] !text-[13px] !no-underline`}>
            목록으로
          </Link>
          <Msg msg={msg} />
        </div>
      </div>
    </form>
  );
}
