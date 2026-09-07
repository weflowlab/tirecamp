"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { INQUIRY_TYPES } from "@/lib/inquiries";

/**
 * 문의 폼 → POST /api/inquiries
 * - 이름 / 연락처 / 문의 유형 / 차종·사이즈(선택) / 내용 / 개인정보 동의
 */
export default function InquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<(typeof INQUIRY_TYPES)[number]>(INQUIRY_TYPES[0]);
  const [car, setCar] = useState("");
  const [content, setContent] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState(""); // 스팸 방지용 숨김 필드
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === "") return setMsg({ ok: false, text: "이름을 입력해 주세요." });
    if (phone.replace(/\D/g, "").length < 9) return setMsg({ ok: false, text: "연락처를 정확히 입력해 주세요." });
    if (content.trim().length < 5) return setMsg({ ok: false, text: "문의 내용을 5자 이상 입력해 주세요." });
    if (!agree) return setMsg({ ok: false, text: "개인정보 수집·이용에 동의해 주세요." });

    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, type, car, content, agree, website }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "접수에 실패했습니다.");
      setName("");
      setPhone("");
      setType(INQUIRY_TYPES[0]);
      setCar("");
      setContent("");
      setAgree(false);
      setMsg({ ok: true, text: "문의가 접수되었습니다. 영업시간 내에 연락드리겠습니다." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "접수에 실패했습니다." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="font-sans">
      <div className="grid grid-cols-2 gap-[12px] max-pc:grid-cols-1">
        <Field label="이름" required>
          <input type="text" className="field" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="연락처" required>
          <input type="tel" className="field" value={phone} maxLength={20} placeholder="010-0000-0000" onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="문의 유형">
          {/* 유형은 버튼 그룹으로 (select 보다 한눈에 보임) */}
          <div className="flex h-[44px] max-pc:h-auto max-pc:flex-wrap">
            {INQUIRY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 border border-line -ml-px first:ml-0 text-[13px] transition-colors max-pc:h-[40px] max-pc:basis-1/2 max-pc:[&:nth-child(3)]:ml-0 ${
                  type === t ? "border-ink bg-ink text-white z-10" : "bg-white text-graphite hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="차종 / 타이어 사이즈">
          <input type="text" className="field" value={car} maxLength={50} placeholder="예: 쏘렌토 MQ4 / 235/60R18" onChange={(e) => setCar(e.target.value)} />
        </Field>
      </div>
      <div className="mt-[12px]">
        <Field label="문의 내용" required>
          <textarea className="field h-[160px]" value={content} maxLength={2000} onChange={(e) => setContent(e.target.value)} />
        </Field>
      </div>
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label className="mt-[14px] flex cursor-pointer items-start gap-[8px] text-[12px] leading-[18px] text-graphite">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-[2px] accent-black" />
        <span>
          문의 답변을 위한 개인정보(이름, 연락처) 수집·이용에 동의합니다.{" "}
          <Link href="/cscenter/personal_info" className="!text-muted underline underline-offset-4 hover:!text-ink" target="_blank">
            내용 보기
          </Link>
        </span>
      </label>

      <div className="mt-[20px] flex items-center justify-between gap-[12px] max-pc:flex-col max-pc:items-stretch">
        <p className={`text-[12px] ${msg ? (msg.ok ? "text-ink" : "text-[#B3261E]") : "text-muted"}`}>{msg ? msg.text : "* 표시는 필수 입력 항목입니다."}</p>
        <button type="submit" disabled={busy} className="btn-fill">
          {busy ? "접수 중..." : "문의 접수"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12px] tracking-[0.02em] text-muted">
        {label}
        {required && <span className="ml-[2px] text-ink">*</span>}
      </span>
      {children}
    </label>
  );
}
