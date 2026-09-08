"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { INQUIRY_TYPES } from "@/lib/inquiries";

/**
 * 문의 폼 → POST /api/inquiries
 * - 이름 / 연락처 / 문의 유형 / 차종·사이즈(선택) / 내용 / 개인정보 동의
 */
export default function InquiryForm() {
  /*
   * 미리 채움 (초기값으로 한 번만 계산 — effect 안에서 setState 하지 않는다)
   * - 타이어 상세 "이 타이어로 문의하기": ?tire=브랜드 모델 → 유형 "타이어 견적"
   * - 검색 결과 "예약하기": ?tire=…&size=225/45R18 4개&type=교체 예약 → 유형 "교체 예약", 차종/사이즈 칸에 사이즈
   */
  const sp = useSearchParams();
  const tireParam = sp.get("tire") ?? "";
  const sizeParam = sp.get("size") ?? "";
  const typeParam = sp.get("type") ?? "";
  const initialType: (typeof INQUIRY_TYPES)[number] = !tireParam
    ? INQUIRY_TYPES[0]
    : (INQUIRY_TYPES as readonly string[]).includes(typeParam)
      ? (typeParam as (typeof INQUIRY_TYPES)[number])
      : "타이어 견적";
  const initialContent = !tireParam ? "" : sizeParam ? `[${tireParam}] ${sizeParam} 예약 문의드립니다.\n희망 날짜: ` : `[${tireParam}] 문의드립니다.\n`;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<(typeof INQUIRY_TYPES)[number]>(initialType);
  const [car, setCar] = useState(tireParam ? sizeParam : "");
  const [content, setContent] = useState(initialContent);
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState(""); // 스팸 방지용 숨김 필드
  const [policyOpen, setPolicyOpen] = useState(false);
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
                className={`flex-1 border border-line -ml-px first:ml-0 px-[4px] text-[12px] tracking-[-0.01em] transition-colors max-pc:h-[40px] max-pc:basis-1/2 max-pc:[&:nth-child(3)]:ml-0 ${
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

      {/* 체크박스 + 문구 + 내용 보기 를 한 줄에 (좁으면 문구만 줄바꿈, "내용 보기"는 문구 끝에 붙음) */}
      <div className="mt-[14px] flex items-start gap-[8px] text-[12px] leading-[18px] text-graphite">
        <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-[2px] accent-black" />
        <p className="text-[12px] text-graphite">
          <label htmlFor="agree" className="cursor-pointer">
            문의 답변을 위한 개인정보(이름, 연락처) 수집·이용에 동의합니다.
          </label>{" "}
          <button type="button" onClick={() => setPolicyOpen(true)} className="whitespace-nowrap !text-muted underline underline-offset-4 hover:!text-ink">
            내용 보기
          </button>
        </p>
      </div>

      {/* 개인정보 수집·이용 요약 (모달) — 새 창으로 전문을 보내지 않고 핵심만 보여준다 */}
      {policyOpen && (
        <>
          <div className="fixed inset-0 z-[1000] bg-black/40" onClick={() => setPolicyOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="개인정보 수집·이용 안내" className="fixed left-1/2 top-1/2 z-[1001] w-[460px] -translate-x-1/2 -translate-y-1/2 bg-white p-[28px] font-sans shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] max-pc:w-[calc(100%-24px)] max-pc:p-[20px]">
            <p className="eyebrow">Privacy</p>
            <h3 className="mt-[4px] text-[18px] font-bold tracking-[-0.02em] text-ink">개인정보 수집·이용 안내</h3>
            <dl className="mt-[16px] border-t border-line text-[13px]">
              {[
                ["수집 항목", "이름, 연락처 (차종은 선택)"],
                ["이용 목적", "문의 확인 및 답변 연락"],
                ["보유 기간", "답변 완료 후 지체 없이 파기"],
                ["동의 거부", "거부할 수 있으나, 거부 시 문의 접수가 어렵습니다"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[84px_1fr] gap-[12px] border-b border-line py-[10px]">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-[16px] flex items-center justify-between gap-[12px]">
              <Link href="/cscenter/personal_info" target="_blank" className="text-[12px] !text-muted underline underline-offset-4 hover:!text-ink">
                개인정보처리방침 전문 보기
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAgree(true);
                  setPolicyOpen(false);
                }}
                className="btn-fill !h-[38px] !px-[20px]"
              >
                확인하고 동의
              </button>
            </div>
          </div>
        </>
      )}

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
